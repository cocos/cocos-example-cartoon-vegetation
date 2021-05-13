
import { _decorator, Component, Node, Button, setDisplayStats, isDisplayStats, director, Size, Vec2, Toggle, gfx, game, sys } from 'cc';
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
    debugToggle: Toggle | null = null;

    @type(Toggle)
    fpsToggle: Toggle | null = null;

    @type(Toggle)
    qualityToggle: Toggle | null = null;

    @type(Toggle)
    floatTextureToggle: Toggle | null = null;

    start () {
        this.node.on(Node.EventType.TOUCH_END, this.showSettings, this);

        if (this.floatTextureToggle) {
            this.floatTextureToggle.setIsCheckedWithoutNotify(director.root!.device.hasFeature(gfx.Feature.TEXTURE_HALF_FLOAT));
        }
        if (this.lodToggle) {
            this.lodToggle.setIsCheckedWithoutNotify(Config.lod);
        }
        if (this.debugToggle) {
            this.debugToggle.setIsCheckedWithoutNotify(Config.debug);
        }
        if (this.qualityToggle) {
            this.qualityToggle.setIsCheckedWithoutNotify(Config.highQuality);
        }
        if (this.fpsToggle) {
            this.fpsToggle.setIsCheckedWithoutNotify(Config.highFps);
        }

        setDisplayStats(Config.debug);
        this.setHighQuality(Config.highQuality);
        this.setHighFps(Config.highFps);
    }

    showSettings () {
        if (this.settings) {
            this.settings.active = !this.settings.active;
        }
    }

    toggleLod () {
        Config.lod = !Config.lod;
    }

    toggleDebug () {
        Config.debug = !Config.debug;
        setDisplayStats(Config.debug);
    }

    toggleQuality () {
        Config.highQuality = !Config.highQuality;
        this.setHighQuality(Config.highQuality);
    }

    toggleHighFps () {
        Config.highFps = !Config.highFps;
        this.setHighFps(Config.highFps);
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

        // hack, TODO: remove when engine fixed dirty flag 
        this.scheduleOnce(() => {
            director.root!.pipeline.pipelineSceneData.shadows.shadowMapDirty = false;
        })
    }

    setHighFps (highFps) {
        if (highFps) {
            game.setFrameRate(60)
        }
        else {
            game.setFrameRate(30)
        }
    }
}
