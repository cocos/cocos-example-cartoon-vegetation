import { Asset, AssetLibrary } from "cc";
import { EDITOR } from "cce.env";

let _loadAssetByUrl: (filePath: string) => Promise<Asset>;

if (EDITOR && typeof (window as any).BUILDER === 'undefined') {
    const Editor = (window as any).Editor;

    _loadAssetByUrl = async function loadAssetByUrl (url: string) {
        let assetUid = await Editor.Message.request('asset-db', 'query-uuid', url);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                AssetLibrary.loadAsset(assetUid, (err: any, asset: Asset) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(asset);
                });
            }, 500);
        })
    }

}

export let loadAssetByUrl = _loadAssetByUrl;
