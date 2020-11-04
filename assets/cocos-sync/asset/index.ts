import { Asset, error } from "cc";
import { path, projectAssetPath } from "../utils/editor";
import { classes, SyncAssetData } from "./asset";

import './material';
import './mesh';

let map: Map<string, SyncAssetData> = new Map;

export function clear () {
    map.clear();
}

export function get (uuid: string): Asset {
    let data = map.get(uuid);
    return data && data.asset;
}

export async function sync (data: SyncAssetData, assetBasePath: string) {
    data.srcPath = path.join(assetBasePath, data.path);
    data.dstPath = path.join(projectAssetPath, data.path);

    let cls = classes.get(data.name);
    if (cls) {
        try {
            data.asset = await cls.sync(data);
        }
        catch(err) {
            error(err);
        }
    }

    map.set(data.uuid, data);
}

