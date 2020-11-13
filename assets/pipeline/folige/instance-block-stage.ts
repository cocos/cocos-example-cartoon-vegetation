import { _decorator, RenderView, ForwardStage, ForwardPipeline, Color, Camera, gfx, pipeline, director, renderer, PipelineStateManager } from "cc";
import { MergeStatics } from "../../cocos-sync/component/merge-statics";
const { ccclass, property } = _decorator;
const { SetIndex } = pipeline;

const colors: Color[] = [new Color(0, 0, 0, 1)];


@ccclass("InstanceBlockStage")
export class InstanceBlockStage extends ForwardStage {
    static get instance (): InstanceBlockStage | null {
        let flow = director.root!.pipeline.flows.find(f => f.name === 'ForwardFlow');
        if (!flow) return null;
        return flow.stages.find(s => s.name === 'InstanceBlockStage') as InstanceBlockStage;
    }
    _name = 'InstanceBlockStage'

    blocks: MergeStatics[] = [];

    addObject (block: MergeStatics) {
        if (this.blocks.indexOf(block) === -1) {
            this.blocks.push(block);
        }
    }
    removeObject (block: MergeStatics) {
        let index = this.blocks.indexOf(block);
        if (index !== -1) {
            this.blocks.splice(index, 1);
        }
    }

    resize () {

    }

    renderInstanceBlocks (view: RenderView) {
        let instancedQueue = (this as any)._instancedQueue;
        instancedQueue.queue.clear();

        for (let bi = 0; bi < this.blocks.length; bi++) {
            let block = this.blocks[bi];
            for (let di = 0; di < block.datas.length; di++) {
                let blocks = block.datas[di].blocks;
                for (let bbi = 0; bbi < blocks.length; bbi++) {
                    let instances = blocks[bbi]._instances;
                    for (let ii = 0; ii < instances.length; ii++) {
                        instancedQueue.queue.add(instances[ii]);
                    }
                }
            }
        }

        const pipeline = this._pipeline as ForwardPipeline;
        const device = pipeline.device;

        const camera = view.camera;
        const vp = camera.viewport;

        // render area is not oriented
        const w = view.window.hasOnScreenAttachments && device.surfaceTransform % 2 ? camera.height : camera.width;
        const h = view.window.hasOnScreenAttachments && device.surfaceTransform % 2 ? camera.width : camera.height;

        let renderArea = (this as any)._renderArea!;
        renderArea.x = vp.x * w;
        renderArea.y = vp.y * h;
        renderArea.width = vp.width * w * pipeline.shadingScale;
        renderArea.height = vp.height * h * pipeline.shadingScale;

        const cmdBuff = pipeline.commandBuffers[0];

        instancedQueue.uploadBuffers(cmdBuff);
        (this as any)._additiveLightQueue.gatherLightPasses(view, cmdBuff);

        const framebuffer = view.window.framebuffer;
        const renderPass = framebuffer.colorTextures[0] ? framebuffer.renderPass : pipeline.getRenderPass(camera.clearFlag);

        if (camera.clearFlag & gfx.ClearFlag.COLOR) {
            // if (pipeline.isHDR) {
            //     SRGBToLinear(colors[0], camera.clearColor);
            //     const scale = pipeline.fpScale / camera.exposure;
            //     colors[0].x *= scale;
            //     colors[0].y *= scale;
            //     colors[0].z *= scale;
            // } else {
            colors[0].x = camera.clearColor.x;
            colors[0].y = camera.clearColor.y;
            colors[0].z = camera.clearColor.z;
            // }
        }

        colors[0].w = camera.clearColor.w;

        cmdBuff.beginRenderPass(renderPass, framebuffer, renderArea,
            colors, camera.clearDepth, camera.clearStencil);

        cmdBuff.bindDescriptorSet(SetIndex.GLOBAL, pipeline.descriptorSet);

        instancedQueue.recordCommandBuffer(device, renderPass, cmdBuff);

        cmdBuff.endRenderPass();
        instancedQueue.queue.clear();
    }

    render (view: RenderView) {
        this.renderInstanceBlocks(view);

        // should not clear the already draw content
        let clearFlag = view.camera.clearFlag;
        view.camera.clearFlag = 0;

        super.render(view);

        view.camera.clearFlag = clearFlag;
    }

    rebuild () {

    }

    destroy () {

    }
}
