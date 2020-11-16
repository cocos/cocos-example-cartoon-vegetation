import { CCObject, getPhaseID, InstancedBuffer, log, Mat4, Material, Mesh, Vec3, _decorator } from "cc";
const { ccclass, property, type, executeInEditMode } = _decorator

import { SyncComponentData, SyncComponent, register } from "./component";

let _tempVec3 = new Vec3;

export interface SyncMergeStatiscData extends SyncComponentData {
    mergeSize: number;
}

@register
export class SyncMergeStatisc extends SyncComponent {
    static clsName = 'MergeStatics';

    static import (comp, data: SyncMergeStatiscData) {
        comp.clear();
        comp.mergeSize = data.mergeSize;
    }
}
