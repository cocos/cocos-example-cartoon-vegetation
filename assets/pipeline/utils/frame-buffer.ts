import { GFXTextureType, GFXTextureUsageBit, GFXFormat, GFXDevice, RenderPipeline, GFXTexture, GFXRenderPass } from "cc";

export function createFrameBuffer (renderPass: GFXRenderPass, pipeline: RenderPipeline, device: GFXDevice, depth = false, width = 0, height = 0) {
    let pipelineAny = pipeline as any;

    width = width || pipelineAny._shadingWidth;
    height = height || pipelineAny._shadingHeight;

    // @ts-ignore
    if (CC_EDITOR) {
        width = device.width;
        height = device.height;
    }

    let texture = device.createTexture({
        type: GFXTextureType.TEX2D,
        usage: GFXTextureUsageBit.COLOR_ATTACHMENT,
        format: GFXFormat.RGBA32F,
        width: width,
        height: height,
    })

    // depth stencil
    let depthTexture: GFXTexture = null;
    if (depth) {
        depthTexture = device.createTexture({
            type: GFXTextureType.TEX2D,
            usage: GFXTextureUsageBit.DEPTH_STENCIL_ATTACHMENT,
            format: device.depthStencilFormat,
            width: width,
            height: height,
        })
    }
    

    // framebuffer
    let frameBuffer = device.createFramebuffer({
        renderPass: renderPass,
        colorTextures: [texture],
        depthStencilTexture: depthTexture,
    })

    return frameBuffer;
}