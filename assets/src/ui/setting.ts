
import { _decorator, Component, Node, Button, setDisplayStats, isDisplayStats, director, Size, Vec2 } from 'cc';
import { Config } from '../utils/config';
const { ccclass, property, type } = _decorator;

@ccclass('Settings')
export class Settings extends Component {
    @type(Node)
    settings: Node | null = null

    @type(Button)
    lodButton: Button | null = null

    @type(Button)
    fpsButton: Button | null = null

    @type(Button)
    qualityButton: Button | null = null

    start () {
        this.node.on(Node.EventType.TOUCH_END, this.showSettings, this);
    }

    showSettings () {
        if (this.settings) {
            this.settings.active = !this.settings.active;
        }
    }

    toggleLod () {
        Config.lod = !Config.lod;
    }

    toggleFps () {
        setDisplayStats(!isDisplayStats())
    }

    toggleQuality () {
        Config.highQuality = !Config.highQuality;

        if (Config.highQuality) {
            director.root!.pipeline.pipelineSceneData.shadows.size = new Vec2(4096, 4096);
        }
        else {
            director.root!.pipeline.pipelineSceneData.shadows.size = new Vec2(1024, 1024);
        }

        director.root!.pipeline.pipelineSceneData.shadows.shadowMapDirty = true;
    }
}
