import { director, Game, game, gfx, sys } from 'cc'

export const Config = {
    lod: true,
    debug: false,
    highFps: true,
    highQuality: false,
    supportBendGrass: false,
    bendGrass: false
}

game.on(Game.EVENT_ENGINE_INITED, () => {
    if (director.root) {
        const halfFeatures = director.root.device.getFormatFeatures(gfx.Format.R16F);
        const features = gfx.FormatFeatureBit.RENDER_TARGET | gfx.FormatFeatureBit.SAMPLED_TEXTURE;
        if ((halfFeatures & features) === features) {
            Config.supportBendGrass = true;
            // if (!sys.isMobile) {
            //     Config.bendGrass = true;
            // }
        }
    }

    if (!sys.isMobile) {
        Config.highFps = true
        Config.highQuality = true
    }
})
