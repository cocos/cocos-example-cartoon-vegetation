import { _decorator, RenderStage, GFXRect, GFXColor, ForwardPipeline, RenderView, ModelComponent, Material, renderer, PipelineStateManager, GFXRenderPass, GFXFormat, GFXLoadOp, GFXStoreOp, GFXTextureLayout, GFXShaderStageFlagBit, GFXDescriptorType, pipeline, GFXType, GFXFilter, GFXAddress, RenderFlow, RenderPipeline, director, Vec4, GFXBufferUsageBit, GFXMemoryUsageBit, GFXClearFlag, GFXCullMode, RenderTexture, GFXUniformSampler, GFXDescriptorSetLayoutBinding, GFXUniformBlock, GFXUniform, GFXBufferInfo, GFXRenderPassInfo, GFXColorAttachment, GFXDepthStencilAttachment, Mat4, getPhaseID } from "cc";
const { ccclass, type } = _decorator;
const { SetIndex, UBOShadow } = pipeline;

import { DepthBufferObject } from './depth-buffer-object';
import { UNIFORM_DEPTH_BUFFER_MAP_BINDING } from '../ubo';


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
const _depthStencilAttachment = new GFXDepthStencilAttachment();
const _renderPassInfo = new GFXRenderPassInfo([_colorAttachment], _depthStencilAttachment);

const _phaseID = getPhaseID('shadow-add');


@ccclass("DepthBufferStage")
export class DepthBufferStage extends RenderStage {
    static get instance (): DepthBufferStage {
        let flow = director.root.pipeline.flows.find(f => f.name === 'ForwardFlow');
        if (!flow) return null;
        return flow.stages.find(s => s.name === 'DepthBufferStage') as DepthBufferStage;
    }

    _name = 'DepthBufferStage'

    private _renderTexture: RenderTexture = null;
    private _renderArea: GFXRect = { x: 0, y: 0, width: 0, height: 0 };

    protected _pipelineStates = { rasterizerState: { cullMode: GFXCullMode.BACK } };


    depthBufferObjects: DepthBufferObject[] = [];

    activate (pipeline: RenderPipeline, flow: RenderFlow) {
        super.activate(pipeline, flow);

        this.updateUBO();
    }

    addObject (obj: DepthBufferObject) {
        this.depthBufferObjects.push(obj);
    }

    removeObject (obj: DepthBufferObject) {
        let index = this.depthBufferObjects.indexOf(obj);
        if (index === -1) return;
        this.depthBufferObjects.splice(index, 1);
    }

    updateUBO (view?: RenderView) {
        const pipeline = this._pipeline as ForwardPipeline;
        const device = pipeline.device;

        let width = 512, height = 512;

        let renderTexture = this._renderTexture;
        if (!renderTexture) {
            renderTexture = new RenderTexture();
            renderTexture.reset({ width, height, passInfo: _renderPassInfo })
            this._renderTexture = renderTexture;

            const samplerHash = renderer.genSamplerHash(_samplerInfo);
            const sampler = renderer.samplerLib.getSampler(device, samplerHash);
            pipeline.descriptorSet.bindSampler(UNIFORM_DEPTH_BUFFER_MAP_BINDING, sampler);
            pipeline.descriptorSet.bindTexture(UNIFORM_DEPTH_BUFFER_MAP_BINDING, renderTexture.getGFXTexture());
        }
        else if (renderTexture.width !== width || renderTexture.height !== height) {
            renderTexture.resize(width, height);
        }


        if (view) {
            let shadowUBO: Float32Array = (pipeline as any)._shadowUBO;
            Mat4.toArray(shadowUBO, view.camera.matViewProj, UBOShadow.MAT_LIGHT_VIEW_PROJ_OFFSET);
            pipeline.commandBuffers[0].updateBuffer(pipeline.descriptorSet.getBuffer(UBOShadow.BINDING), shadowUBO);
        }
    }

    render (view: RenderView) {
        this.updateUBO(view);

        let renderTexture = this._renderTexture;

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

        _colorAttachment.loadOp = GFXLoadOp.CLEAR;

        cmdBuff.beginRenderPass(renderPass, frameBuffer, this._renderArea!,
            colors, camera.clearDepth, camera.clearStencil);

        cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);

        const depthBufferObjects = this.depthBufferObjects;
        for (let i = 0; i < depthBufferObjects.length; ++i) {
            const ro = depthBufferObjects[i].getComponent(ModelComponent);
            const subModels = ro.model.subModels;
            for (let m = 0; m < subModels.length; m++) {
                const subModel = subModels[m];

                for (let pi = 0; pi < subModel.passes.length; pi++) {
                    const pass = subModel.passes[pi];
                    if (pass.phase !== _phaseID) {
                        continue;
                    }

                    const shaderHandle = renderer.SubModelPool.get(subModel.handle, renderer.SubModelView.SHADER_0 + pi);
                    const shader = renderer.ShaderPool.get(shaderHandle as any);
                    if (!shader) {
                        continue;
                    }
    
                    const hPass = pass.handle;
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
