import { Material, Mesh, MeshRenderer } from "cc";
import { SyncComponentData, SyncComponent, register } from "./component";
import * as SyncAssets from '../asset';

export interface SyncMeshRendererData extends SyncComponentData {
    materilas: string[];
    mesh: string;
}

@register
export class SyncMeshRenderer extends SyncComponent {
    static clsName = 'cc.MeshRenderer';

    static import (comp: MeshRenderer, data: SyncMeshRendererData) {
        data.materilas.forEach((uuid, index) => {
            let m = SyncAssets.get(uuid);
            if (m) {
                comp.setMaterial(m as Material, index);
            }
        })

        let m = SyncAssets.get(data.mesh) as Mesh;
        comp.mesh = m;
    }
}
