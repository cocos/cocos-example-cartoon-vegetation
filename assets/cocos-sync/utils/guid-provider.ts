import { Component, _decorator } from "cc";

const { ccclass, property, executeInEditMode } = _decorator;

let guids: Map<string, GuidProvider>
if (!(window as any).__GuidProvider_guids__) {
    (window as any).__GuidProvider_guids__ = guids = new Map();
}
else {
    guids = (window as any).__GuidProvider_guids__;
}

@ccclass('GuidProvider')
@executeInEditMode
export class GuidProvider extends Component {
    static guids = guids;

    @property
    guid = '';

    onEnable () {
        if (this.guid) {
            guids.set(this.guid, this);
        }
    }
    onDisable () {
        if (this.guid) {
            guids.delete(this.guid);
        }
    }
}
