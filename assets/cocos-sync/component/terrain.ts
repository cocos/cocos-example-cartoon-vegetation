import { Terrain, TerrainInfo, TERRAIN_BLOCK_TILE_COMPLEXITY, Vec4 } from "cc";
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

    terrainWidth: number;
    terrainHeight: number;
}


@register
export class SyncTerrain extends SyncComponent {
    static clsName = 'cc.Terrain';

    static import (comp: Terrain, compData: SyncTerrainData) {
        let heightMapResolution = Math.max(compData.heightmapWidth - 1, compData.heightmapHeight - 1);
        let terrainSize = Math.max(compData.terrainWidth, compData.terrainHeight);

        let info = new TerrainInfo();
        info.tileSize = terrainSize / heightMapResolution;
        info.blockCount = [heightMapResolution / TERRAIN_BLOCK_TILE_COMPLEXITY, heightMapResolution / TERRAIN_BLOCK_TILE_COMPLEXITY];

        comp.rebuild(info);


        // heightmap
        let heightmapWidth = compData.heightmapWidth;
        let heightmapHeight = compData.heightmapHeight;

        for (let wi = 0; wi < heightmapWidth; wi++) {
            for (let hi = 0; hi < heightmapHeight; hi++) {
                comp.setHeight(wi, hi, compData.heightDatas[wi + hi * heightmapWidth]);
            }
        }

        for (let wi = 0; wi < heightmapWidth; wi++) {
            for (let hi = 0; hi < heightmapHeight; hi++) {
                let n = comp._calcNormal(wi, hi);
                comp._setNormal(wi, hi, n);
            }
        }

        // weightmap

        let layerCount = compData.terrainLayers.length;
        let weightDatas = compData.weightDatas;

        let values: number[] = new Array(Math.max(layerCount, 4)).fill(0);

        const weightmapWidth = comp.info.blockCount[0] * comp.info.weightMapSize;
        const weightmapHeight = comp.info.blockCount[1] * comp.info.weightMapSize;

        if (weightmapWidth > compData.weightmapWidth) {
            let xScale = weightmapWidth / compData.weightmapWidth;
            let yScale = weightmapHeight / compData.weightmapHeight;

            for (let wi = 0; wi < weightmapWidth; wi++) {
                for (let hi = 0; hi < weightmapHeight; hi++) {

                    let mappedWi = Math.floor(wi * compData.weightmapWidth / weightmapWidth);
                    let mappedHi = Math.floor(hi * compData.weightmapHeight / weightmapHeight);

                    let mappedNWi = mappedWi + 1;
                    let mappedNHi = mappedHi + 1;

                    let px = (wi % xScale) / xScale;
                    let py = (hi % yScale) / yScale;

                    let sum = 0;
                    for (let li = 0; li < layerCount; li++) {
                        let v00 = weightDatas[(mappedWi + mappedHi * compData.weightmapWidth) * layerCount + li];
                        let v10 = weightDatas[(mappedNWi + mappedHi * compData.weightmapWidth) * layerCount + li];
                        let v01 = weightDatas[(mappedWi + mappedNHi * compData.weightmapWidth) * layerCount + li];
                        let v11 = weightDatas[(mappedNWi + mappedNHi * compData.weightmapWidth) * layerCount + li];

                        let v =
                            (1 - px) * (1 - py) * v00 +
                            (px) * (1 - py) * v10 +
                            (1 - px) * (py) * v01 +
                            (px) * (py) * v11;

                        sum += v;
                        values[li] = v;
                    }
                    for (let li = 0; li < layerCount; li++) {
                        values[li] /= sum;
                    }

                    Vec4.fromArray(_tempVec4, values);
                    comp.setWeight(wi, hi, _tempVec4);
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
