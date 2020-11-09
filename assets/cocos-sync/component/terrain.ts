import { Terrain, TERRAIN_BLOCK_TILE_COMPLEXITY, Vec4 } from "cc";
import { cce } from "../utils/editor";
import { SyncComponentData, SyncComponent, register } from "./component";

let _tempVec4 = new Vec4();

export interface SyncTerrainLayer {
    name: string;
}

export interface SyncTerrainData extends SyncComponentData {
    heightmapWidth: number;
    heightmapHeight: number;
    heightDatas: number[];

    terrainLayers: SyncTerrainLayer[];
    weightmapWidth: number;
    weightmapHeight: number;
    weightDatas: number[];
}


@register
export class SyncTerrain extends SyncComponent {
    static clsName = 'cc.Terrain';

    static import (comp: Terrain, compData: SyncTerrainData) {
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

        let values: number[] = new Array(Math.max(layerCount, 4)).fill(0);

        for (let wi = 0; wi < width; wi++) {
            for (let hi = 0; hi < height; hi++) {
                if (wi === (width - 1) || hi === (height - 1)) {
                    break;
                }

                for (let wis = 0; wis <= 1; wis += 1 / uWeigthScale) {
                    for (let his = 0; his <= 1; his += 1 / vWeigthScale) {

                        let sum = 0;
                        for (let li = 0; li < layerCount; li++) {
                            let v00 = weightDatas[(wi + hi * weightmapWidth) * layerCount + li];
                            let v10 = weightDatas[((wi + 1) + hi * weightmapWidth) * layerCount + li];
                            let v01 = weightDatas[(wi + (hi + 1) * weightmapWidth) * layerCount + li];
                            let v11 = weightDatas[((wi + 1) + (hi + 1) * weightmapWidth) * layerCount + li];

                            let v =
                                (1 - wis) * (1 - his) * v00 +
                                (wis) * (1 - his) * v10 +
                                (1 - wis) * (his) * v01 +
                                (wis) * (his) * v11;

                            sum += v;
                            values[li] = v;
                        }

                        for (let li = 0; li < layerCount; li++) {
                            values[li] /= sum;
                        }

                        Vec4.fromArray(_tempVec4, values);
                        comp.setWeight(wis * uWeigthScale + wi * uWeigthScale, his * vWeigthScale + hi * vWeigthScale, _tempVec4);
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
        });

        if (!cce.Terrain.curComp) {
            cce.Terrain.curComp = comp;
            cce.Terrain.assetUid = comp._asset && comp._asset._uuid;
        }
        (comp as any).isTerrainChange = true;
    }
}
