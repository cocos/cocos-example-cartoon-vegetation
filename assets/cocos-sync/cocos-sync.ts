import { director, error, find, IVec3Like, log, Mat4, Material, Mesh, Node, Quat, Vec3, Vec4, warn } from "cc";
import { EDITOR } from "cce.env";
import { SyncAssetData } from "./asset/asset";

import * as SyncComponents from './component';
import * as SyncAssets from './asset';

import { SyncComponentData } from "./component/component";
import { cce, io, path, projectAssetPath } from "./utils/editor";
import { GuidProvider } from "./utils/guid-provider";
import { SyncMeshRenderer, SyncMeshRendererData } from "./component/mesh-renderer";
import { MergeData, MergeStatics } from "./component/merge-statics";

let _tempQuat = new Quat();
let _tempVec3 = new Vec3();

interface SyncNodeData {
    name: string;
    uuid: string;

    position: IVec3Like;
    scale: IVec3Like;
    eulerAngles: IVec3Like;

    children: SyncNodeData[];
    components: string[];

    needMerge: boolean;

    // runtime
    parentIndex: number;
    node: Node;

    mergeToNodeIndex: number;
    matrix: Mat4;
}


interface SyncSceneData {
    nodeCount: number;
    componentCount: number;
    children: SyncNodeData[];

    assetBasePath: string;
    assets: string[];
}


if (EDITOR) {
    let app = (window as any).__cocos_sync_io__;
    if (!app) {
        app = (window as any).__cocos_sync_io__ = io('8877')
        app.on('connection', (socket: any) => {
            log('CocosSync Connected!');

            socket.on('disconnect', () => {
                log('CocosSync Disconnected!');
            });

            socket.on('sync-datas', syncDataString);
        })
    }

    function syncDataString (dataStr: string) {
        let data: SyncSceneData;
        try {
            data = JSON.parse(dataStr);
        }
        catch (err) {
            error(err);
            return;
        }

        collectSceneData(data);

        syncAssets(() => {
            syncDatas();
        });
    }

    let _sceneData: SyncSceneData | null = null;

    let _totalNodeCount = 0;
    let _totalComponentCount = 0;
    let _nodeCount = 0;
    let _componentCount = 0;

    let _mergeList: MergeStatics[] = [];
    let _nodeList: SyncNodeData[] = [];
    let _rootNodeList: SyncNodeData[] = [];
    let _currentNodeIndex = 0;
    function collectSceneData (data: SyncSceneData) {
        _mergeList.length = 0;
        _nodeList.length = 0;
        _rootNodeList.length = 0;
        _currentNodeIndex = 0;

        _totalNodeCount = data.nodeCount;
        _totalComponentCount = data.componentCount;

        _sceneData = data;

        if (data.children) {
            for (let i = 0, l = data.children.length; i < l; i++) {
                data.children[i].parentIndex = -1;
                _rootNodeList.push(data.children[i]);
                collectNodeData(data.children[i]);
            }
        }
    }
    function collectNodeData (data: SyncNodeData) {
        let parentData = _nodeList[data.parentIndex];
        if (parentData) {
            if (parentData.needMerge) {
                data.mergeToNodeIndex = data.parentIndex;
            }
            else if (parentData.mergeToNodeIndex >= 0) {
                data.mergeToNodeIndex = parentData.mergeToNodeIndex;
            }

            if (data.mergeToNodeIndex >= 0) {
                if (!parentData.matrix) {
                    Quat.fromEuler(_tempQuat, parentData.eulerAngles.x, parentData.eulerAngles.y, parentData.eulerAngles.z);
                    parentData.matrix = Mat4.fromRTS(new Mat4, _tempQuat, parentData.position, parentData.scale);
                }
                if (!data.matrix) {
                    Quat.fromEuler(_tempQuat, data.eulerAngles.x, data.eulerAngles.y, data.eulerAngles.z);
                    data.matrix = Mat4.fromRTS(new Mat4, _tempQuat, data.position, data.scale);

                    if (parentData.matrix) {
                        data.matrix = Mat4.multiply(data.matrix, parentData.matrix, data.matrix);
                    }
                }
            }
        }

        let index = _nodeList.length;
        _nodeList.push(data);

        if (data.children) {
            for (let i = 0, l = data.children.length; i < l; i++) {
                data.children[i].parentIndex = index;
                collectNodeData(data.children[i]);
            }
        }
    }


    function syncAssets (cb: Function) {
        let count = 0;
        let total = _sceneData!.assets.length;

        SyncAssets.clear();
        if (total <= 0) {
            return cb();
        }

        _sceneData!.assets.forEach(async dataStr => {
            let data: SyncAssetData = JSON.parse(dataStr);

            await SyncAssets.sync(data, _sceneData!.assetBasePath);

            count++;
            if (count >= total) {
                cb();
            }
        });
    }


    let _syncIntervalID = -1;
    let _startTime = 0;
    function syncDatasFrame () {
        for (let i = 0; i < 1000; i++) {
            let node = _nodeList[_currentNodeIndex];
            if (node) {
                let parent: Node | null = null;
                if (node.mergeToNodeIndex >= 0) {
                    mergeNodeData(node);
                }
                else {
                    let finded = true;
                    if (node.parentIndex !== -1) {
                        let parentData = _nodeList[node.parentIndex];
                        if (!parentData) {
                            warn('Can not find parent node data with index : ' + node.parentIndex);
                            finded = false;
                        }
                        parent = parentData.node;
                    }
                    if (finded) {
                        syncNodeData(node, parent);
                    }
                }
            }
            else {
                warn('Can not find node data with index : ' + _currentNodeIndex);
            }

            if (++_currentNodeIndex >= _nodeList.length) {
                finishMerge();

                log(`End sync : ${Date.now() - _startTime} ms`);

                clearInterval(_syncIntervalID);
                _syncIntervalID = -1;
                return;
            }
        }

        log(`Sync : Progress - ${_currentNodeIndex / _nodeList.length}, NodeCount - ${_currentNodeIndex}`);
        setTimeout(syncDatasFrame, 100);
    }
    function syncDatas () {
        if (_syncIntervalID !== -1) {
            clearInterval(_syncIntervalID);
        }

        log('Begin sync...');
        log('Total Node Count : ', _totalNodeCount);
        log('Total Component Count : ', _totalComponentCount);
        _startTime = Date.now();

        syncDatasFrame();
    }

    function finishMerge () {
        for (let i = 0; i < _mergeList.length; i++) {
            _mergeList[i].rebuild();
        }
    }

    function mergeNodeData (data: SyncNodeData) {
        _nodeCount++;

        if (!data.components) {
            return;
        }

        let root = _nodeList[data.mergeToNodeIndex];
        let rootNode = root && root.node;
        if (!root || !rootNode) {
            error('Can not find node by mergeToNodeIndex : ', data.mergeToNodeIndex);
            return;
        }

        for (let i = 0, l = data.components.length; i < l; i++) {
            _componentCount++;

            let cdata: SyncComponentData = JSON.parse(data.components[i]);
            if (cdata.name !== SyncMeshRenderer.clsName) {
                continue;
            }

            let mrData = (cdata as SyncMeshRendererData);
            let materials = mrData.materilas.map(uuid => {
                return SyncAssets.get(uuid) as Material;
            })
            let m = SyncAssets.get(mrData.mesh) as Mesh;

            let mergeInfo = rootNode.getComponent(MergeStatics);
            if (mergeInfo) {
                mergeInfo.addData(m, data.matrix, materials);
            }

            break;
        }
    }

    function syncNodeData (data: SyncNodeData, parent: Node | null = null) {
        parent = parent || director.getScene() as any;
        let guid = data.uuid;

        let provider = GuidProvider.guids.get(guid);

        let node: Node;
        if (!provider || !provider.enabledInHierarchy) {
            node = new Node(data.name);
            provider = node.addComponent(GuidProvider);
            provider.guid = guid;
        }
        else {
            node = provider.node;
        }

        node.parent = parent;
        node.setPosition(data.position as Vec3);
        node.setScale(data.scale as Vec3);
        node.eulerAngles = data.eulerAngles as Vec3;

        data.node = node;

        _nodeCount++;

        if (data.components) {
            for (let i = 0, l = data.components.length; i < l; i++) {
                let cdata: SyncComponentData = JSON.parse(data.components[i]);
                SyncComponents.sync(cdata, node);
                _componentCount++;
            }
        }


        if (data.needMerge) {
            let comp = node.getComponent('MergeStatics');
            if (comp) {
                _mergeList.push(comp);
            }
        }

        return node;
    }
}
