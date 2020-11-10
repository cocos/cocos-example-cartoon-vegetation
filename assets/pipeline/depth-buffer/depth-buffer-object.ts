import { _decorator, Component, Node } from 'cc';
import { DepthBufferStage } from './depth-buffer-stage';
const { ccclass, executeInEditMode } = _decorator;

@ccclass('DepthBufferObject')
@executeInEditMode
export class DepthBufferObject extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    onEnable () {
        if (DepthBufferStage.instance) {
            DepthBufferStage.instance.addObject(this);
        }
    }
    onDisable () {
        if (DepthBufferStage.instance) {
            DepthBufferStage.instance.removeObject(this);
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
