import { _decorator, Component, Node, Camera, renderer, Color, CCObject, Vec3, GFXClearFlag } from 'cc';
import { GrassBendRenderStage } from '../grass-bend-render-stage';
const { ccclass, property, executeInEditMode, type } = _decorator;

const neutralVector = new Color(0.5*255, 0, 0.5*255, 0);

@ccclass('GrassBenderRenderer')
@executeInEditMode
export class GrassBenderRenderer extends Component {

    @type(Node)
    followTarget: Node | null = null;

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
        if (GrassBendRenderStage.instance) {
            GrassBendRenderStage.instance.rebuild();
        }
    }

    _renderCamera: Camera | null = null;
    get renderCamera () {
        return this._renderCamera;
    }

    start () {
        if (!this._renderCamera) {
            let node = new Node('GrassBendCamera');
            node._objFlags |= CCObject.Flags.DontSave | CCObject.Flags.HideInHierarchy;
            node.parent = this.node;
            node.eulerAngles = new Vec3(-90, 0, 0);

            let camera = node.addComponent(Camera);
            camera.projection = renderer.scene.CameraProjection.ORTHO;
            camera.orthoHeight = this.range;
            camera.far = this.range * 2;
            camera.clearColor = neutralVector;
            camera.clearFlags = GFXClearFlag.NONE;
            camera.visibility = 0;
            camera.priority = -100;

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
        if (this.followTarget && this._renderCamera) {
            let followPosition = this.followTarget.worldPosition;
            let worldPosition = this._renderCamera.node.worldPosition;
            if (followPosition.x !== worldPosition.x || followPosition.y + this.range !== worldPosition.y || followPosition.z !== worldPosition.z) {
                this._renderCamera.node.setWorldPosition(followPosition.x, followPosition.y + this.range, followPosition.z);
            }
        }
    }
}
