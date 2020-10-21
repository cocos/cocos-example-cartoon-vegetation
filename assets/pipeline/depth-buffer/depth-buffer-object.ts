import { _decorator, Component, Node } from 'cc';
import { DepthBufferStage } from './depth-buffer-stage';
const { ccclass, property } = _decorator;

@ccclass('DepthBufferObject')
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
        DepthBufferStage.instance.addObject(this);
    }
    onDisable () {
        DepthBufferStage.instance.removeObject(this);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
