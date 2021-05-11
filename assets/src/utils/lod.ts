
import { _decorator, Component, Node, Mesh, MeshRenderer, Vec3, Camera, find } from 'cc';
const { ccclass, property, type } = _decorator;

const vec3_tmp1 = new Vec3;
const vec3_tmp2 = new Vec3;

@ccclass('LodConfig')
export class LodConfig {
    @type(Mesh)
    mesh: Mesh | null = null;

    @property
    distance = 1;
}

@ccclass('Lod')
export class Lod extends Component {
    @type(LodConfig)
    lods: LodConfig[] = []

    @type(Node)
    target: Node | null = null;

    meshRenderer: MeshRenderer | null = null;
    start () {
        this.meshRenderer = this.getComponent(MeshRenderer);
    }

    update () {
        if (!this.meshRenderer || !this.target) {
            return;
        }

        let distance = Vec3.distance(this.node.getWorldPosition(vec3_tmp1), this.target.getWorldPosition(vec3_tmp2));

        let lods = this.lods;
        let lodLevel = lods.length - 1;
        for (let i = 0; i < lods.length; i++) {
            if (distance < lods[i].distance) {
                lodLevel = i;
                break;
            }
        }

        let lod = lods[lodLevel];
        if (!lod || this.meshRenderer.mesh === lod.mesh) {
            return;
        }

        this.meshRenderer.mesh = lod.mesh;
    }
}

