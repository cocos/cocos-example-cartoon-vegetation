
import { _decorator, Component, Node, Button, setDisplayStats, isDisplayStats, director, Size, Vec2, Toggle, gfx } from 'cc';
import { Config } from '../utils/config';
const { ccclass, property, type } = _decorator;

enum PCF_TYPE {
    Hard,
    X5,
    X9,
    X25
}

@ccclass('Settings')
export class Settings extends Component {
    @type(Node)
    settings: Node | null = null

    @type(Toggle)
    lodToggle: Toggle | null = null;

    @type(Toggle)
    fpsToggle: Toggle | null = null;

    @type(Toggle)
    qualityToggle: Toggle | null = null;

    @type(Toggle)
    floatTextureToggle: Toggle | null = null;

    start () {
        this.node.on(Node.EventType.TOUCH_END, this.showSettings, this);

        if (this.floatTextureToggle) {
            this.floatTextureToggle.isChecked = director.root!.device.hasFeature(gfx.Feature.TEXTURE_HALF_FLOAT);
        }
        if (this.lodToggle) {
            this.lodToggle.isChecked = Config.lod;
        }
        if (this.fpsToggle) {
            this.fpsToggle.isChecked = Config.fps;
        }
        if (this.qualityToggle) {
            this.qualityToggle.isChecked = Config.highQuality;
        }

        setDisplayStats(Config.fps);
        this.setHighQuality(Config.highQuality);
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
        Config.fps = !Config.fps;
        setDisplayStats(Config.fps);
    }

    toggleQuality () {
        Config.highQuality = !Config.highQuality;
        this.setHighQuality(Config.highQuality);
    }

    setHighQuality (highQuality: boolean) {
        const globals = director.getScene()!.globals;
        if (highQuality) {
            globals.shadows.shadowMapSize = new Vec2(1024, 1024);
            globals.shadows.pcf = PCF_TYPE.X25;
        }
        else {
            globals.shadows.shadowMapSize = new Vec2(512, 512);
            globals.shadows.pcf = PCF_TYPE.X5;
        }
    }
}
