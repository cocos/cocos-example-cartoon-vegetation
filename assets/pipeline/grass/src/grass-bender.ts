import { _decorator, Component, Node } from 'cc';
import { GrassBendRenderStage } from '../grass-bend-render-stage';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('GrassBender')
@executeInEditMode
export class GrassBender extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    onEnable () {
        if (GrassBendRenderStage.instance) {
            GrassBendRenderStage.instance.addGrassBender(this);
        }
    }

    onDisable () {
        if (GrassBendRenderStage.instance) {
            GrassBendRenderStage.instance.removeGrassBender(this);
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
