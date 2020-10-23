import { _decorator, RenderStage, GFXRect, GFXColor, GFXCommandBuffer, ForwardPipeline, RenderView, ModelComponent, Material, renderer, PipelineStateManager, GFXRenderPass, GFXFormat, GFXLoadOp, GFXStoreOp, GFXTextureLayout, GFXShaderStageFlagBit, GFXDescriptorType, pipeline, GFXType, GFXFilter, GFXAddress, RenderFlow, RenderPipeline, director, Vec4, GFXBufferUsageBit, GFXMemoryUsageBit, GFXClearFlag, GFXCullMode, RenderTexture, GFXUniformSampler, GFXDescriptorSetLayoutBinding, GFXUniformBlock, GFXUniform, GFXBufferInfo, GFXRenderPassInfo, GFXColorAttachment, GFXDepthStencilAttachment } from "cc";
const { SetIndex } = pipeline;
const { ccclass, type } = _decorator;

import { GrassBender } from "./src/grass-bender";
import { GrassBenderRenderer } from "./src/grass-bender-renderer";
import { UBOGrassBend, UNIFORM_GRASS_BEND_MAP_BINDING } from '../ubo';

const tempVec4 = new Vec4;

const colors: GFXColor[] = [{ x: 1, y: 1, z: 1, w: 1 }];

const _samplerInfo = [
    GFXFilter.LINEAR,
    GFXFilter.LINEAR,
    GFXFilter.NONE,
    GFXAddress.CLAMP,
    GFXAddress.CLAMP,
    GFXAddress.CLAMP,
];


const _colorAttachment = new GFXColorAttachment();
_colorAttachment.endLayout = GFXTextureLayout.SHADER_READONLY_OPTIMAL;
_colorAttachment.format = GFXFormat.RGBA32F;
const _depthStencilAttachment = new GFXDepthStencilAttachment();
const _renderPassInfo = new GFXRenderPassInfo([_colorAttachment], _depthStencilAttachment);


@ccclass("GrassBendRenderStage")
export class GrassBendRenderStage extends RenderStage {
    static get instance (): GrassBendRenderStage {
        let flow = director.root.pipeline.flows.find(f => f.name === 'ForwardFlow');
        if (!flow) return null;
        return flow.stages.find(s => s.name === 'GrassBendRenderStage') as GrassBendRenderStage;
    }

    _name = 'GrassBendRenderStage'

    private _renderTexture: RenderTexture = null;
    private _renderArea: GFXRect = { x: 0, y: 0, width: 0, height: 0 };

    private _grassBendRenderer: GrassBenderRenderer = null;

    protected _bendUBO = new Float32Array(UBOGrassBend.COUNT);

    protected _pipelineStates = { rasterizerState: { cullMode: GFXCullMode.BACK } };


    grassBenders: GrassBender[] = [];

    activate (pipeline: RenderPipeline, flow: RenderFlow) {
        super.activate(pipeline, flow);

        this.updateUBO();
    }

    addGrassBender (bender: GrassBender) {
        this.grassBenders.push(bender);
    }

    removeGrassBender (bender: GrassBender) {
        let index = this.grassBenders.indexOf(bender);
        if (index === -1) return;
        this.grassBenders.splice(index, 1);
    }

    setGrassBendRenderer (renderer: GrassBenderRenderer) {
        this._grassBendRenderer = renderer;
    }

    updateUBO () {
        const pipeline = this._pipeline as ForwardPipeline;
        const device = pipeline.device;

        let width = 512, height = 512;
        if (this._grassBendRenderer) {
            width = height = this._grassBendRenderer.resolution;
        }

        let renderTexture = this._renderTexture;
        if (!renderTexture) {
            renderTexture = new RenderTexture();
            renderTexture.reset({ width, height, passInfo: _renderPassInfo })
            this._renderTexture = renderTexture;

            const samplerHash = renderer.genSamplerHash(_samplerInfo);
            const sampler = renderer.samplerLib.getSampler(device, samplerHash);
            pipeline.descriptorSet.bindSampler(UNIFORM_GRASS_BEND_MAP_BINDING, sampler);
            pipeline.descriptorSet.bindTexture(UNIFORM_GRASS_BEND_MAP_BINDING, renderTexture.getGFXTexture());
        }
        else if (renderTexture.width !== width || renderTexture.height !== height) {
            renderTexture.resize(width, height);
        }

        if (this._grassBendRenderer) {
            let bendRenderer = this._grassBendRenderer;
            let pos = this._grassBendRenderer.renderCamera.node.worldPosition;
            tempVec4.set(
                pos.x,
                pos.z,
                bendRenderer.range * 2,
                1
            )
            Vec4.toArray(this._bendUBO, tempVec4, UBOGrassBend.UVOffset);
        }

        let buffer = pipeline.descriptorSet.getBuffer(UBOGrassBend.BINDING);
        if (!buffer) {
            buffer = pipeline.device.createBuffer(new GFXBufferInfo(
                GFXBufferUsageBit.UNIFORM | GFXBufferUsageBit.TRANSFER_DST,
                GFXMemoryUsageBit.HOST | GFXMemoryUsageBit.DEVICE,
                UBOGrassBend.SIZE,
            ));
            pipeline.descriptorSet.bindBuffer(UBOGrassBend.BINDING, buffer);
        }
        buffer.update(this._bendUBO);
    }

    render (view: RenderView) {
        if (!this._grassBendRenderer) {
            return;
        }
        if (view.camera.node !== this._grassBendRenderer.renderCamera.node) {
            return;
        }

        this.updateUBO();

        let renderTexture = this._renderTexture;
        this._grassBendRenderer.renderCamera.targetTexture = renderTexture;
        
        const pipeline = this._pipeline as ForwardPipeline;
        const device = pipeline.device;
        const camera = view.camera;

        // command buffer
        const cmdBuff = pipeline.commandBuffers[0];

        const vp = camera.viewport;
        this._renderArea!.x = vp.x * renderTexture.width;
        this._renderArea!.y = vp.y * renderTexture.height;
        this._renderArea!.width = vp.width * renderTexture.width * pipeline.shadingScale;
        this._renderArea!.height = vp.height * renderTexture.height * pipeline.shadingScale;

        const frameBuffer = renderTexture.window.framebuffer;
        const renderPass = frameBuffer.renderPass;

        colors[0].x = camera.clearColor.x;
        colors[0].y = camera.clearColor.y;
        colors[0].z = camera.clearColor.z;
        colors[0].w = camera.clearColor.w;

        _colorAttachment.loadOp = GFXLoadOp.CLEAR;

        cmdBuff.beginRenderPass(renderPass, frameBuffer, this._renderArea!,
            colors, camera.clearDepth, camera.clearStencil);

        cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);

        const grassBenders = this.grassBenders;
        let m = 0; let p = 0;
        for (let i = 0; i < grassBenders.length; ++i) {
            const ro = grassBenders[i].getComponent(ModelComponent);
            const subModels = ro.model.subModels;
            for (m = 0; m < subModels.length; m++) {
                const subModel = subModels[m];
                
                let grassBendStartIdx = 0;

                const shaderHandle = renderer.SubModelPool.get(subModel.handle, renderer.SubModelView.SHADER_0 + grassBendStartIdx);
                const shader = renderer.ShaderPool.get(shaderHandle as any);
                if (!shader) {
                    continue;
                }
                
                const hPass = subModel.passes[grassBendStartIdx].handle;
                const ia = subModel.inputAssembler;
                const pso = PipelineStateManager.getOrCreatePipelineState(device, hPass, shader, renderPass, ia);

                const descriptorSet = renderer.DSPool.get(renderer.PassPool.get(hPass, renderer.PassView.DESCRIPTOR_SET));
                cmdBuff.bindPipelineState(pso);
                cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, descriptorSet);
                cmdBuff.bindDescriptorSet(SetIndex.LOCAL, subModel.descriptorSet);
                cmdBuff.bindInputAssembler(ia);
                cmdBuff.draw(ia);
            }
        }

        cmdBuff.endRenderPass();

        _colorAttachment.loadOp = GFXLoadOp.LOAD;
    }

    rebuild () {
        this.clear();
    }
    resize () {
    }
    destroy () {
        this.clear();
    }
    clear () {
        if (this._renderTexture) {
            this._renderTexture.destroy();
        }
        this._renderTexture = null;
    }
}
