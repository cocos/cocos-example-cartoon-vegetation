import { CCObject, Component, find, log, Mat4, Material, Mesh, MeshRenderer, Node, Vec3, _decorator } from "cc";
import { cce } from "../utils/editor";
const { ccclass, property, type, executeInEditMode } = _decorator

import { SyncComponentData, SyncComponent, register } from "./component";

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
            if (data.blocks[i].name === blockName) {
                block = data.blocks[i];
            }
        }
        if (!block) {
            block = new MergeBlockData();
            block.name = blockName;
            data.blocks.push(block);
        }

        block._matrices.push(matrix);
    }

    clear () {
        this.datas.length = 0;
    }

    _rebuildIndex = 0;
    _blockIndex = 0;
    rebuild () {
        this.node.removeAllChildren();
        this._rebuildIndex = 0;
        this._blockIndex = 0;
    }

    start () {
        this.rebuild();
    }

    update () {
        if (this._rebuildIndex >= this.datas.length) {
            return;
        }

        cce.Engine.repaintInEditMode();

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
        }

        let block = data.blocks[this._blockIndex++];
        if (!block) {
            this._rebuildIndex++;
            this._blockIndex = 0;
            return;
        }

        let merged = new Mesh;
        let matrices = block._matrices;
        for (let mi = 0; mi < matrices.length; mi++) {
            let matrix = matrices[mi];

            Mat4.getTranslation(_tempVec3, matrix);
            let x = Math.floor(_tempVec3.x / this.mergeSize);
            let z = Math.floor(_tempVec3.z / this.mergeSize);

            merged.merge(mesh!, matrix);
        }

        let blockNode = new Node(block.blockName);

        let meshRenderer = blockNode.addComponent(MeshRenderer);
        for (let mi = 0; mi < data.materials.length; mi++) {
            meshRenderer.setMaterial(data.materials[mi], mi);
        }
        meshRenderer.mesh = merged;

        blockNode.parent = meshChild;
    }
}
