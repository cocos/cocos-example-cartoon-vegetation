import { Component, director, error, find, JsonAsset, log, Node, Terrain, TERRAIN_BLOCK_TILE_COMPLEXITY, Vec3, Vec4, warn } from "cc";
import { EDITOR } from "cce.env";

let _tempVec4 = new Vec4();

interface SyncComponentData {
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

    position: Vec3;
    scale: Vec3;
    eulerAngles: Vec3;

    children: SyncNodeData[];
    components: string[];
}


if (EDITOR) {
    const io = (window as any).require('socket.io');

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
        try {
            let data: SyncNodeData = JSON.parse(dataStr);
            syncData(data);
        }
        catch (err) {
            error(err);
        }
    }

    function syncData (data: SyncNodeData, parent: Node = null) {
        parent = parent || director.getScene() as any;
        let node = find(data.name, parent);
        if (!node) {
            node = new Node(data.name);
            node.parent = parent;
        }

        if (data.components) {
            data.components.forEach(c => {
                try {
                    let data: SyncComponentData = JSON.parse(c);
                    syncComponent(data, node);
                }
                catch (err) {
                    error(err);
                }
            })
        }

        if (data.children) {
            data.children.forEach(c => {
                syncData(c, node);
            })
        }
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
