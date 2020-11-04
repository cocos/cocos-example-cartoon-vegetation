import { EDITOR } from "cce.env";
import { loadAssetByUrl } from "../utils/asset-operation";
import { Editor, projectAssetPath } from "../utils/editor";
import { formatPath } from "../utils/path";
import { register, SyncAsset, SyncAssetData } from "./asset";

let fse, path;

if (EDITOR) {
    fse = (window as any).require('fs-extra');
    path = (window as any).require('path');
}

export interface SyncMeshData extends SyncAssetData {

}

@register
export class SyncMesh extends SyncAsset {
    static clsName = 'cc.Mesh';

    static async sync (data: SyncMeshData) {
        await new Promise((resolve, reject) => {
            fse.ensureDirSync(path.dirname(data.dstPath))
            fse.copyFile(data.srcPath, data.dstPath, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        })

        let url = `db://assets/${formatPath(path.relative(data.dstPath, projectAssetPath))}`
        await Editor.Message.request('asset-db', 'refresh-asset', url);

        return loadAssetByUrl(url);
    }
}