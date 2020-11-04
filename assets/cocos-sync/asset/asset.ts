import { Asset } from "cc";

export interface SyncAssetData {
    name: string;
    uuid: string;
    path: string;

    // runtime
    asset: Asset;

    srcPath: string;
    dstPath: string;
}

export class SyncAsset {
    static clsName = 'cc.Asset';

    static async sync (data: SyncAssetData) {
        return null;
    }
}

export let classes: Map<string, typeof SyncAsset> = new Map();
export function register(cls: typeof SyncAsset) {
    classes.set(cls.clsName, cls);
}
