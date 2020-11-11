import { CCObject, Component, EditBox, find, getPhaseID, InstancedBuffer, log, Mat4, Material, Mesh, MeshRenderer, Node, Vec3, _decorator } from "cc";
import { EDITOR } from "cce.env";
import { InstanceBlockStage } from "../../pipeline/folige/instance-block-stage";
import { cce } from "../utils/editor";
const { ccclass, property, type, executeInEditMode } = _decorator

import { SyncComponentData, SyncComponent, register } from "./component";

const _phaseID = getPhaseID('default');

let _tempVec3 = new Vec3;

export interface SyncMergeStatiscData extends SyncComponentData {
    mergeSize: number;
}

@register
export class SyncMergeStatisc extends SyncComponent {
    static clsName = 'MergeStatics';

    static import (comp: MergeStatics, data: SyncMergeStatiscData) {
        comp.clear();
        comp.mergeSize = data.mergeSize;
    }
}

@ccclass('MergeBlockData')
export class MergeBlockData extends CCObject {
    @property
    blockName = '';

    @property
    _matrices: Mat4[] = [];

    _instances: InstancedBuffer[] = [];
}

@ccclass('MergeData')
export class MergeData extends CCObject {
    @type(Mesh)
    mesh: Mesh | null = null;

    @type(Material)
    materials: Material[] = [];

    @type(MergeBlockData)
    blocks: MergeBlockData[] = [];
}

@ccclass('MergeStatics')
@executeInEditMode
export class MergeStatics extends Component {
    @property
    mergeSize = 10;

    @type(MergeData)
    datas: MergeData[] = [];

    addData (mesh: Mesh, matrix: Mat4, materials: Material[]) {
        let datas = this.datas;
        let data: MergeData | null = null;
        for (let i = 0; i < datas.length; i++) {
            if (datas[i].mesh === mesh) {
                data = datas[i];
                break;
            }
        }

        if (!data) {
            data = new MergeData();
            data.mesh = mesh;
            data.materials = materials;
            this.datas.push(data);
        }

        Mat4.getTranslation(_tempVec3, matrix);
        let x = Math.floor(_tempVec3.x / this.mergeSize);
        let z = Math.floor(_tempVec3.z / this.mergeSize);
        let blockName = `${x}_${z}`;

        let block: MergeBlockData | null = null;
        for (let i = 0; i < data.blocks.length; i++) {
            if (data.blocks[i].blockName === blockName) {
                block = data.blocks[i];
            }
        }
        if (!block) {
            block = new MergeBlockData();
            block.blockName = blockName;
            data.blocks.push(block);
        }

        block._matrices.push(matrix);
    }

    clear () {
        this.datas.length = 0;
    }

    _rebuildIndex = 0;
    _blockIndex = 0;

    _startTime = 0;

    rebuild () {
        log('Start rebuild instances...');

        this._startTime = Date.now();

        this.node.removeAllChildren();
        this._rebuildIndex = 0;
        this._blockIndex = 0;
    }

    start () {
        this.rebuild();
    }

    onEnable () {
        if (InstanceBlockStage.instance) {
            InstanceBlockStage.instance.addObject(this);
        }
    }
    onDisable () {
        if (InstanceBlockStage.instance) {
            InstanceBlockStage.instance.removeObject(this);
        }
    }

    update () {
        if (this._rebuildIndex >= this.datas.length) {
            if (this._startTime !== 0) {
                log(`End rebuild instances : ${(Date.now() - this._startTime) / 1000}s.`);
                this._startTime = 0;
            }
            return;
        }

        if (EDITOR) {
            cce.Engine.repaintInEditMode();
        }

        let data = this.datas[this._rebuildIndex];

        log(`Merge Statics Mesh : ${this._rebuildIndex} - ${this.datas.length}, ${this._blockIndex} - ${data.blocks.length}`);

        let mesh = data.mesh;
        let meshName = mesh!.name + '_' + mesh!._uuid;

        if (!mesh?.loaded) {
            let failedNode = new Node('Failed - ' + meshName);
            failedNode.parent = this.node;

            this._rebuildIndex++;
            this._blockIndex = 0;
            return;
        }

        let meshChild = this.node.children[this._rebuildIndex];
        if (!meshChild) {
            meshChild = new Node(meshName);

            meshChild.parent = this.node;

            let mr = meshChild.addComponent(MeshRenderer);
            mr.mesh = mesh;

            for (let mi = 0; mi < data.materials.length; mi++) {
                mr.setMaterial(data.materials[mi], mi);
            }

            mr.enabled = false;
        }

        let block = data.blocks[this._blockIndex++];
        if (!block) {
            this._rebuildIndex++;
            this._blockIndex = 0;
            return;
        }

        // let merged = new Mesh;
        // let matrices = block._matrices;
        // for (let mi = 0; mi < matrices.length; mi++) {
        //     let matrix = matrices[mi];
        //     merged.merge(mesh!, matrix);
        // }

        // let blockNode = new Node(block.blockName);

        // let meshRenderer = blockNode.addComponent(MeshRenderer);
        // for (let mi = 0; mi < data.materials.length; mi++) {
        //     meshRenderer.setMaterial(data.materials[mi], mi);
        // }
        // meshRenderer.mesh = merged;

        // blockNode.parent = meshChild;

        let mr = meshChild.getComponent(MeshRenderer);
        let model = mr!.model!;
        let subModels = model.subModels!;
        for (let i = 0; i < subModels.length; i++) {
            let subModel = subModels[i];
            let passes = subModel.passes
            for (let pi = 0; pi < passes.length; pi++) {
                if (passes[pi].phase !== _phaseID) {
                    continue;
                }

                let instance = new InstancedBuffer(passes[pi]);

                let matrices = block._matrices;
                for (let mi = 0; mi < matrices.length; mi++) {
                    let matrix = matrices[mi];
                    meshChild.worldMatrix.set(matrix);

                    (model as any)._transformUpdated = true;
                    model.updateUBOs(0);

                    instance.merge(subModel, model.instancedAttributes, pi);
                }

                block._instances.push(instance);
            }
        }
    }
}
