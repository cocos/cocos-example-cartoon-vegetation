import { _decorator, Component, Node, Camera, renderer, Color, CCObject, Vec3, GFXClearFlag } from 'cc';
import { GrassBendRenderStage } from '../../pipeline/grass/grass-bend-render-stage';
const { ccclass, property, executeInEditMode, type } = _decorator;

const neutralVector = new Color(0.5*255, 0, 0.5*255, 0);

@ccclass('GrassBenderRenderer')
@executeInEditMode
export class GrassBenderRenderer extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @type(Node)
    followTarget: Node = null;

    @property
    _range = 32
    @property
    get range () {
        return this._range;
    }
    set range (v) {
        this._range = v;
        if (this._renderCamera) {
            this._renderCamera.orthoHeight = this.range;
        }
    }

    @property
    _resolution = 512;
    @property
    get resolution () {
        return this._resolution;
    }
    set resolution (v) {
        if (v === this._resolution) {
            return;
        }
        this._resolution = v;
        GrassBendRenderStage.instance.rebuild();
    }

    _renderCamera: Camera = null;
    get renderCamera () {
        return this._renderCamera;
    }

    start () {
        if (!this._renderCamera) {
            let node = new Node('GrassBendCamera');
            node._objFlags |= CCObject.Flags.DontSave;// | CCObject.Flags.HideInHierarchy;
            node.parent = this.node;
            node.eulerAngles = new Vec3(-90, 0, 0);

            let camera = node.addComponent(Camera);
            camera.projection = renderer.scene.CameraProjection.ORTHO;
            camera.orthoHeight = this.range;
            camera.far = this.range * 2;
            camera.clearColor = neutralVector;
            camera.clearFlags = GFXClearFlag.NONE;
            camera.visibility = 0;

            this._renderCamera = camera;
        }
    }

    onEnable () {
        if (GrassBendRenderStage.instance) {
            GrassBendRenderStage.instance.setGrassBendRenderer(this);
        }
    }
    onDisable () {
        if (GrassBendRenderStage.instance) {
            GrassBendRenderStage.instance.setGrassBendRenderer(null);
        }
    }

    update (deltaTime: number) {
        if (this.followTarget) {
            let followPosition = this.followTarget.worldPosition;
            this._renderCamera.node.setWorldPosition(followPosition.x, followPosition.y + this.range, followPosition.z);
        }
    }
}
