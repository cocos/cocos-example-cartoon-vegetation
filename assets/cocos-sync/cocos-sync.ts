import { director, error, log,  Node, Vec3, Vec4, warn } from "cc";
import { EDITOR } from "cce.env";
import { SyncAssetData } from "./asset/asset";

import * as component from './component';
import * as asset from './asset';

import { SyncComponentData } from "./component/component";
import { cce, io, path, projectAssetPath } from "./utils/editor";

interface SyncNodeData {
    name: string;
    uuid: string;

    position: Vec3;
    scale: Vec3;
    eulerAngles: Vec3;

    children: SyncNodeData[];
    components: string[];

    // runtime
    parentIndex: number;
    node: Node
}


interface SyncSceneData {
    nodeCount: number;
    componentCount: number;
    children: SyncNodeData[];

    assetBasePath: string;
    assets: SyncAssetData[];
}


if (EDITOR) {
    let app = (window as any).__cocos_sync_io__;
    if (!app) {
        app = (window as any).__cocos_sync_io__ = io('8877')
        app.on('connection', socket => {
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

    let _sceneData: SyncSceneData = null;

    let _totalNodeCount = 0;
    let _totalComponentCount = 0;
    let _nodeCount = 0;
    let _componentCount = 0;

    let _nodeList: SyncNodeData[] = [];
    let _rootNodeList: SyncNodeData[] = [];
    let _currentNodeIndex = 0;
    function collectSceneData (data: SyncSceneData) {
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
        let index = _nodeList.length;
        _nodeList.push(data);

        if (data.children) {
            for (let i = 0, l = data.children.length; i < l; i++) {
                data.children[i].parentIndex = index;
                collectNodeData(data.children[i]);
            }
        }
    }


    function syncAssets (cb) {
        let count = 0;
        let total = _sceneData.assets.length;
       
        asset.clear();
        _sceneData.assets.forEach(async data => {
            await asset.sync(data, _sceneData.assetBasePath);
            
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
                let parent: Node;
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
            else {
                warn('Can not find node data with index : ' + _currentNodeIndex);
            }

            if (++_currentNodeIndex >= _nodeList.length) {
                // for (let ri = 0; ri < _rootNodeList.length; ri++) {
                //     _rootNodeList[ri].node.parent = director.getScene() as any;
                // }

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

    function syncNodeData (data: SyncNodeData, parent: Node = null) {
        parent = parent || director.getScene() as any;
        let uuid = data.uuid;
        let node = cce.Node.query(uuid) as Node;
        if (!node || !node.activeInHierarchy) {
            node = new Node(data.name);
            (node as any)._id = uuid;
        }
        node.parent = parent;
        node.setPosition(data.position);
        node.setScale(data.scale);
        node.eulerAngles = data.eulerAngles;

        data.node = node;

        _nodeCount++;

        if (data.components) {
            for (let i = 0, l = data.components.length; i < l; i++) {
                let cdata: SyncComponentData = JSON.parse(data.components[i]);
                component.sync(cdata, node);
                _componentCount++;
            }
        }

        return node;
    }
}
