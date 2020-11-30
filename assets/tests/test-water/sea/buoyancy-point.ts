// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, RigidBody } from 'cc';
import { BuoyancyManager } from './buoyancy-manager';
const { ccclass, property } = _decorator;

@ccclass('BuoyancyPoint')
export class BuoyancyPoint extends Component {
    @property
    forceMultiply = 1;

    body: RigidBody | null = null;

    onEnable () {
        if (BuoyancyManager._instance) {
            BuoyancyManager._instance.addPoint(this);
        }
    }

    onDisable () {
        if (BuoyancyManager._instance) {
            BuoyancyManager._instance.removePoiint(this);
        }
    }

    start () {
        this.findBody();
    }

    findBody () {
        // Your initialization goes here.

        let node: Node | null = this.node;
        let body: RigidBody | null = null;
        while (node) {
            body = node.getComponent(RigidBody);
            if (body) {
                break;
            }

            node = node.parent;
        }

        this.body = body;
    }
}
