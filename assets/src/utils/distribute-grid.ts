import { _decorator, Component, Node, Material, ModelComponent, Prefab, instantiate, CCObject, utils, Mesh, MeshRenderer } from 'cc';
const { ccclass, property, executeInEditMode, type } = _decorator;

@ccclass('DistributeGrid')
@executeInEditMode
export class DistributeGrid extends Component {
    @type(Material)
    _material: Material | null = null;
    @type(Material)
    get material () {
        return this._material;
    }
    set material (v) {
        this._material = v;
        this.updateMaterial();
    }

    @property
    _space = 5
    @property
    get space () {
        return this._space;
    }
    set space (v) {
        this._space = v;
        this.distribute();
    }

    @type(Prefab)
    _template: Prefab | null = null;
    @type(Prefab)
    get template () {
        return this._template;
    }
    set template (v) {
        this._template = v;
        this.distribute();
    }

    @property
    _count = 10;
    @property
    get count () {
        return this._count;
    }
    set count (v) {
        this._count = v;
        this.distribute();
    }


    onEnable () {
        this.distribute();
        this.updateMaterial();
    }

    distribute () {
        if (!this.template) {
            return;
        }

        let mesh: Mesh = new Mesh;
        let c = instantiate(this.template);
        this.mergeMesh(c, mesh);

        let rowLength = Math.pow(this.count, 0.5) | 0;
        this.node.removeAllChildren();
        for (let i = 0; i < this.count; i++) {

            let c = new Node();
            let mr = c.addComponent(MeshRenderer);
            mr.mesh = mesh;
            c.setPosition(i % rowLength * this.space, 0, Math.floor(i / rowLength) * this.space);
            c._objFlags |= CCObject.Flags.DontSave | CCObject.Flags.HideInHierarchy;

            c.parent = this.node;
        }
    }

    mergeMesh (node: Node, mesh: Mesh) {
        let mr = node.getComponent(MeshRenderer);
        if (mr && mr.mesh) {
            mesh.merge(mr.mesh, node.worldMatrix);
        }

        for (let i = 0; i < node.children.length; i++) {
            this.mergeMesh(node.children[i], mesh);
        }
    }

    updateMaterial () {
        if (!this.material) return;

        let comps = this.node.getComponentsInChildren(ModelComponent)
        for (let i = 0; i < comps.length; i++) {
            let m = comps[i]
            m.setMaterial(this.material, 0);
        }
    }
}
