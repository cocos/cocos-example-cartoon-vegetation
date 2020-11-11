import { Asset } from "cc";
import { loadAssetByUrl } from "../utils/asset-operation";
import { cce, Editor, fse, path, projectAssetPath } from "../utils/editor";
import { register, SyncAsset, SyncAssetData } from "./asset";
import { SyncMeshData } from "./mesh";

export interface SyncMaterialData extends SyncAssetData {
}

@register
export class SyncMaterial extends SyncAsset {
    static clsName = 'cc.Material';

    static async sync (data: SyncMeshData): Promise<Asset | null> {
        data.path = data.path.replace(path.extname(data.path), '') + '.mtl';
        data.dstPath = path.join(projectAssetPath, data.path);

        const dstUrl = `db://assets/${data.path}`;

        if (!fse.existsSync(data.dstPath)) {
            const defaultUrl = 'db://internal/default-material.mtl';
            const defaultUuid = await Editor.Message.request('asset-db', 'query-uuid', defaultUrl);
            const materialDump = await cce.Asset.queryMaterial(defaultUuid);
            if (materialDump) {
                materialDump.data.forEach(t => {
                    t.passes.forEach(p => {
                        let instanceDef = p.defines.find(d => d.name === 'USE_INSTANCING');
                        if (instanceDef) {
                            instanceDef.value = true;
                        }
                    })
                })
            }

            const mtl = await cce.Asset.decodeMaterial(materialDump);
            await Editor.Message.request('asset-db', 'create-asset', dstUrl, mtl);
        }

        return loadAssetByUrl(dstUrl);
    }
}

