import { Asset } from "cc";
import { EDITOR } from "cce.env";
import { loadAssetByUrl } from "../utils/asset-operation";
import { Editor, fse, path, projectAssetPath } from "../utils/editor";
import { formatPath } from "../utils/path";
import { register, SyncAsset, SyncAssetData } from "./asset";

export interface SyncMeshData extends SyncAssetData {

}

@register
export class SyncMesh extends SyncAsset {
    static clsName = 'cc.Mesh';

    static async sync (data: SyncMeshData): Promise<Asset | null>  {
        await new Promise((resolve, reject) => {
            fse.ensureDirSync(path.dirname(data.dstPath))
            fse.copyFile(data.srcPath, data.dstPath, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        })

        let url = `db://assets/${formatPath(path.relative(projectAssetPath, data.dstPath))}`
        await Editor.Message.request('asset-db', 'refresh-asset', url);

        return loadAssetByUrl(url);
    }
}