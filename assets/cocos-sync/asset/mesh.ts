import { Asset, error, IVec3Like } from 'cc';
import { loadAssetByUrl } from '../utils/asset-operation';
import { Editor, fse, path, projectAssetPath } from '../utils/editor';
import { toGltfMesh } from '../utils/gltf';
import { formatPath } from '../utils/path';
import { register, SyncAsset, SyncAssetData } from './asset';

export interface SyncMeshData extends SyncAssetData {
    meshName: string;

    vertices: number[];
    uv: number[];
    normals: number[];
    boneWeights: number[];
    indices: number[];

    min: IVec3Like;
    max: IVec3Like;
}

@register
export class SyncMesh extends SyncAsset {
    static clsName = 'cc.Mesh';

    static async sync (data: SyncMeshData): Promise<Asset | null> {
        let basenameNoExt = path.basename(data.dstPath).replace(path.extname(data.dstPath), '');
        let dstPath = path.join(path.dirname(data.dstPath), basenameNoExt, data.meshName + '.gltf');

        await new Promise((resolve, reject) => {
            let content;
            let mtime;

            if (fse.existsSync(dstPath)) {
                const srcStats = fse.statSync(data.srcPath);

                try {
                    content = fse.readJSONSync(dstPath);
                }
                catch (err) {
                }

                mtime = srcStats.mtime.toJSON();
                if (content && mtime === content.__mtime__) {
                    resolve();
                    return;
                }
            }


            let gltf = toGltfMesh(data);

            (gltf as any).__mtime__ = mtime;

            fse.ensureDirSync(path.dirname(dstPath));
            fse.writeJSON(dstPath, gltf, (err: any) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        });

        const url = `db://assets/${formatPath(path.relative(projectAssetPath, dstPath))}/${data.meshName}.mesh`;
        await Editor.Message.request('asset-db', 'refresh-asset', url);

        return loadAssetByUrl(url);
    }
}
