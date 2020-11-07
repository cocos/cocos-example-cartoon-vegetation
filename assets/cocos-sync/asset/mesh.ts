import { Asset } from 'cc';
import { loadAssetByUrl } from '../utils/asset-operation';
import { Editor, fse, path, projectAssetPath } from '../utils/editor';
import { formatPath } from '../utils/path';
import { register, SyncAsset, SyncAssetData } from './asset';

export interface SyncMeshData extends SyncAssetData {
    meshName: string;
}

@register
export class SyncMesh extends SyncAsset {
    static clsName = 'cc.Mesh';

    static async sync (data: SyncMeshData): Promise<Asset | null> {
        await new Promise((resolve, reject) => {
            if (fse.existsSync(data.dstPath)) {
                const srcStats = fse.fstatSync(data.srcPath);
                const dstStats = fse.fstatSync(data.dstPath);

                if (srcStats.mtime.toJSON() === dstStats.mtime.toJSON()) {
                    resolve();
                    return;
                }
            }

            fse.ensureDirSync(path.dirname(data.dstPath));
            fse.copyFile(data.srcPath, data.dstPath, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            });
        });

        const url = `db://assets/${formatPath(path.relative(projectAssetPath, data.dstPath))}/${data.meshName}.mesh`;
        await Editor.Message.request('asset-db', 'refresh-asset', url);

        return loadAssetByUrl(url);
    }
}
