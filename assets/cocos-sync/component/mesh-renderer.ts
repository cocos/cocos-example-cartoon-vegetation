import { Material, MeshRenderer } from "cc";
import { SyncComponentData, SyncComponent } from "./component";
import * as SyncAssets from '../asset';

export interface SyncMeshRendererData extends SyncComponentData {
    materilas: string[];
    mesh: string;
}


export class SyncMeshRenderer extends SyncComponent {
    static clsName = 'cc.MeshRenderer';

    static import (comp: MeshRenderer, data: SyncMeshRendererData) {
        data.materilas.forEach((uuid, index) => {
            let m = SyncAssets.get(uuid);
            if (m) {
                comp.setMaterial(m as Material, index);
            }
        })
    }
}
