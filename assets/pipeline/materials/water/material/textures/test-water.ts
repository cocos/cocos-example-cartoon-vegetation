import { _decorator, Component, Node, director, LabelComponent } from 'cc';
const { ccclass, property, type } = _decorator;

@ccclass('TestWater')
export class TestWater extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    @property({
        animatable: true
    })
    get skyIllum () {
        return director.getRunningScene().globals.ambient.skyIllum;
    }
    set skyIllum (v) {
        director.getRunningScene().globals.ambient.skyIllum = v;
    }

    @type(LabelComponent)
    skyIllumLabel: LabelComponent = null;

    start () {
        // Your initialization goes here.
    }

    update (deltaTime: number) {
        if (this.skyIllumLabel) {
            this.skyIllumLabel.string = Math.round(this.skyIllum) + '';
        }
    }
}
