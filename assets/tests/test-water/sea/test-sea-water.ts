import { _decorator, Component, Node, director, LabelComponent, Canvas, find, instantiate, Vec3, systemEvent, SystemEventType } from 'cc';
const { ccclass, property, type } = _decorator;

@ccclass('TestWater')
export class TestWater extends Component {
    @property({
        animatable: true
    })
    get skyIllum () {
        return director.getScene()!.globals.ambient.skyIllum;
    }
    set skyIllum (v) {
        director.getScene()!.globals.ambient.skyIllum = v;
    }

    @type(LabelComponent)
    skyIllumLabel: LabelComponent | null = null;

    @type(Node)
    dynamicTemplates: Node | null = null;

    @type(Node)
    dynamicRoot: Node | null = null;

    start () {
        // Your initialization goes here.
        for (let i = 0; i < 5; i++) {
            this.generateDynamic();
        }
    }

    generateDynamic () {
        if (!this.dynamicTemplates || !this.dynamicRoot) {
            return;
        }
        let templates = this.dynamicTemplates.children;

        let index = Math.floor(Math.random() * templates.length);
        let template = templates[index];

        if (!template) {
            return;
        }

        let node = instantiate(template);
        node.position = Vec3.ZERO;

        let scale = node.getScale();
        let randomScale = 0.5 + Math.random();
        scale.multiplyScalar(randomScale);
        node.scale = scale;

        node.parent = this.dynamicRoot;
    }

    update (deltaTime: number) {
        if (this.skyIllumLabel) {
            this.skyIllumLabel.string = Math.round(this.skyIllum) + '';
        }
    }
}
