import { Component, director, error, find, JsonAsset, log, Node, Terrain, TERRAIN_BLOCK_TILE_COMPLEXITY, Vec3, Vec4, warn } from "cc";
import { EDITOR } from "cce.env";

let _tempVec4 = new Vec4();

interface SyncComponentData {
    uuid: number;
    name: string;
}

interface SyncTerrainLayer {
    name: string;
}

interface SyncTerrainData extends SyncComponentData {
    heightmapWidth: number;
    heightmapHeight: number;
    heightDatas: number[];

    terrainLayers: SyncTerrainLayer[];
    weightmapWidth: number;
    weightmapHeight: number;
    weightDatas: number[];
}

interface SyncNodeData {
    name: string;
    uuid: number;

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
}


if (EDITOR) {
    const cce = (window as any).cce;
    const io = (window as any).require('socket.io');
    const XXH = (window as any).require('xxhashjs');

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
        syncDatas();
    }


    let _totalNodeCount = 0;
    let _totalComponentCount = 0;
    let _nodeCount = 0;
    let _componentCount = 0;

    let _nodeList: SyncNodeData[] = [];
    let _currentNodeIndex = 0;
    function collectSceneData (data: SyncSceneData) {
        _nodeList.length = 0;
        _currentNodeIndex = 0;

        _totalNodeCount = data.nodeCount;
        _totalComponentCount = data.componentCount;

        if (data.children) {
            for (let i = 0, l = data.children.length; i < l; i++) {
                data.children[i].parentIndex = -1;
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
                log(`End sync : ${Date.now() - _startTime} ms`);

                clearInterval(_syncIntervalID);
                _syncIntervalID = -1;
                return;
            }
        }

        log(`Sync : Progress - ${_currentNodeIndex / _nodeList.length}, NodeCount - ${_currentNodeIndex}`);
        setTimeout(syncDatasFrame, 500);
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
        // let node = find(data.name, parent);
        let uuid = XXH.h32().update(data.uuid.toString()).digest().toString(16).padEnd(8, '0');
        let node = cce.Node.query(uuid) as Node;
        if (!node) {
            node = new Node(data.name);
            (node as any)._id = uuid;
            node.parent = parent;
        }
        node.setPosition(data.position);
        node.setScale(data.scale);
        node.eulerAngles = data.eulerAngles;
        data.node = node;

        _nodeCount++;

        if (data.components) {
            for (let i = 0, l = data.components.length; i < l; i++) {
                let cdata: SyncComponentData = JSON.parse(data.components[i]);
                syncComponent(cdata, node);
            }
        }

        // if (data.children) {
        //     for (let i = 0, l = data.children.length; i < l; i++) {
        //         syncNodeData(data.children[i], node);
        //     }
        // }

        return node;
    }

    let compSyncs = {
        'cc.Terrain' (comp: Terrain, compData: SyncTerrainData) {
            const mapWidth = comp.info.size.width;
            const mapHeight = comp.info.size.height;

            // heightmap
            let heightmapWidth = compData.heightmapWidth;
            let heightmapHeight = compData.heightmapHeight;

            let width = Math.min(mapWidth, heightmapWidth);
            let height = Math.min(mapHeight, heightmapHeight)

            for (let wi = 0; wi < width; wi++) {
                for (let hi = 0; hi < height; hi++) {
                    comp.setHeight(wi, hi, compData.heightDatas[wi + hi * heightmapWidth]);
                }
            }

            for (let wi = 0; wi < width; wi++) {
                for (let hi = 0; hi < height; hi++) {
                    let n = comp._calcNormal(wi, hi);
                    comp._setNormal(wi, hi, n);
                }
            }

            // weightmap
            const uWeigthScale = comp.info.weightMapSize / TERRAIN_BLOCK_TILE_COMPLEXITY;
            const vWeigthScale = comp.info.weightMapSize / TERRAIN_BLOCK_TILE_COMPLEXITY;

            let weightmapWidth = compData.weightmapWidth;
            let weightmapHeight = compData.weightmapHeight;

            width = Math.min(mapWidth, weightmapWidth);
            height = Math.min(mapHeight, weightmapHeight);

            let layerCount = compData.terrainLayers.length;
            let weightDatas = compData.weightDatas;
            for (let wi = 0; wi < width; wi++) {
                for (let hi = 0; hi < height; hi++) {
                    _tempVec4.set(Vec4.ZERO);

                    let indexStart = (wi + hi * weightmapWidth) * layerCount;

                    let sum = 0;
                    for (let li = 0; li < layerCount; li++) {
                        sum += Math.abs(weightDatas[indexStart + li]);
                    }

                    for (let li = 0; li < layerCount; li++) {
                        let value = Math.abs(weightDatas[indexStart + li]) / sum;
                        if (li === 0) {
                            _tempVec4.x = value;
                        }
                        else if (li === 1) {
                            _tempVec4.y = value;
                        }
                        else if (li === 2) {
                            _tempVec4.z = value;
                        }
                        else if (li === 3) {
                            _tempVec4.w = value;
                        }
                    }

                    if (wi === (width - 1) || hi === height) {
                        continue;
                    }

                    for (let wis = wi * uWeigthScale, wie = (wi + 1) * uWeigthScale; wis < wie; wis++) {
                        for (let his = hi * vWeigthScale, hie = (hi + 1) * vWeigthScale; his < hie; his++) {
                            comp.setWeight(wis, his, _tempVec4);
                        }
                    }
                }
            }

            comp.getBlocks().forEach(b => {
                b._updateHeight();

                for (let i = 0; i < layerCount; i++) {
                    b.setLayer(i, i);
                }
                b._updateWeightMap();
            })
        }
    }

    function syncComponent (compData: SyncComponentData, node: Node) {
        _componentCount++;

        let comp = node.getComponent(compData.name);
        if (!comp) {
            comp = node.addComponent(compData.name);
            if (!comp) {
                warn(`CocosSync: failed to add component ${compData.name}.`);
                return;
            }
        }

        if (compSyncs[compData.name]) {
            compSyncs[compData.name](comp, compData);
        }
    }

}
