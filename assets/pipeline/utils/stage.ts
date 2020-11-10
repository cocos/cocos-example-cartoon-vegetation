import { GFXCommandBuffer, GFXDevice, GFXRenderPass, pipeline, PipelineStateManager, renderer } from "cc";
const { SetIndex } = pipeline;

export function commitBuffer (subModels: renderer.scene.SubModel[], cmdBuff: GFXCommandBuffer, device: GFXDevice, renderPass: GFXRenderPass, phaseID: number) {
    for (let m = 0; m < subModels.length; m++) {
        const subModel = subModels[m];

        for (let pi = 0; pi < subModel.passes.length; pi++) {
            const pass = subModel.passes[pi];
            if (pass.phase !== phaseID) {
                continue;
            }

            const shaderHandle = renderer.SubModelPool.get(subModel.handle, renderer.SubModelView.SHADER_0 + pi);
            const shader = renderer.ShaderPool.get(shaderHandle as any);
            if (!shader) {
                continue;
            }

            const hPass = pass.handle;
            const ia = subModel.inputAssembler;
            const pso = PipelineStateManager.getOrCreatePipelineState(device, pass, shader, renderPass, ia);

            const descriptorSet = renderer.DSPool.get(renderer.PassPool.get(hPass, renderer.PassView.DESCRIPTOR_SET));
            cmdBuff.bindPipelineState(pso);
            cmdBuff.bindDescriptorSet(SetIndex.MATERIAL, descriptorSet);
            cmdBuff.bindDescriptorSet(SetIndex.LOCAL, subModel.descriptorSet);
            cmdBuff.bindInputAssembler(ia);
            cmdBuff.draw(ia);
        }
    }
}