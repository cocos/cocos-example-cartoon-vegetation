import { Asset, assetManager } from "cc";
import { EDITOR } from "cce.env";

let _loadAssetByUrl: (filePath: string) => Promise<Asset | null> = async (url: string) => { return null };

if (EDITOR && typeof (window as any).BUILDER === 'undefined') {
    const Editor = (window as any).Editor;

    _loadAssetByUrl = async function loadAssetByUrl (url: string) {
        let assetUid = await Editor.Message.request('asset-db', 'query-uuid', url);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                assetManager.loadAny(assetUid, (err: any, asset: Asset) => {
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
