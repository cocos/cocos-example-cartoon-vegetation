import { _decorator, Component, Node, Material, ModelComponent } from 'cc';
const { ccclass, property, executeInEditMode, type } = _decorator;

@ccclass('DistributeGrid')
@executeInEditMode
export class DistributeGrid extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @type(Material)
    _material: Material = null;
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


    onEnable () {
        this.distribute();
        this.updateMaterial();
    }

    distribute () {
        let children = this.node.children;
        let rowLength = Math.pow(children.length, 0.5) | 0;
        for (let i = 0; i < children.length; i++) {
            children[i].setPosition( i % rowLength * this.space, 0, Math.floor(i / rowLength) * this.space)
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

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
