// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Vec3, Vec2, Animation, lerp, AnimationClip, AnimationState, animation, AnimationComponent, RigidBody } from 'cc';
import input from '../utils/input';
const { ccclass, property, type } = _decorator;

let tempVec3 = new Vec3;

@ccclass('Hero')
export class Hero extends Component {
    @property
    moveSpeed = 10;

    @property
    runSpeed = 20;

    @type(Animation)
    animation: Animation = null;

    @type(RigidBody)
    rigidBody: RigidBody = null;

    jumping = false;

    speed = new Vec2;
    targetSpeed = new Vec2;

    rotation = 0;
    targetRotation = 0;

    _currentAnim = '';

    start () {
        this.animation.on(AnimationComponent.EventType.STOP, this.onAnimationStop.bind(this))
    }

    play (name) {
        if (!this.animation) {
            return;
        }
        if (this._currentAnim === name) {
            let state = this.animation.getState(name);
            if (state.wrapMode !== AnimationClip.WrapMode.Normal) {
                return;
            }
        }
        this._currentAnim = name

        this.animation.crossFade(name, 0.1);
    }

    onAnimationStop (type, state) {
        if (state.name === 'UnarmedJumpRunning') {
            this.jumping = false;
        }
    }

    update (deltaTime: number) {
        // Your update function goes here.

        let moving = false;
        let speed = this.speed;
        let speedAmount = this.moveSpeed;
        if (input.key.shift) {
            speedAmount = this.runSpeed;
        }

        this.targetSpeed.x = this.targetSpeed.y = 0;

        if (input.key.left) {
            this.targetRotation += 90 * deltaTime;
        }
        else if (input.key.right) {
            this.targetRotation -= 90 * deltaTime;
        }

        let targetRotationRad = this.targetRotation * Math.PI / 180;
        if (input.key.up) {
            this.targetSpeed.x = speedAmount * Math.sin(targetRotationRad);
            this.targetSpeed.y = speedAmount * Math.cos(targetRotationRad);
            moving = true;
        }
        // else if (input.key.down) {
        //     this.targetSpeed.x = -speedAmount;
        //     moving = true;
        // }

        Vec2.lerp(speed, speed, this.targetSpeed, deltaTime * 5);


        if (input.key.space) {
            if (!this.jumping) {
                this.jumping = true;
                this.play('UnarmedJumpRunning');
            }
        }

        if (this.jumping) {

        }
        else if (moving) {
            if (input.key.shift) {
                this.play('FastRun');
            }
            else {
                this.play('Running');
            }
        }
        else {
            speed.x = speed.y = 0;
            this.play('Yawn');
        }

        this.rotation = this.targetRotation;//lerp(this.rotation, this.targetRotation, deltaTime * 5);

        this.rigidBody.getLinearVelocity(tempVec3);
        tempVec3.x = speed.x;
        tempVec3.z = speed.y;
        this.rigidBody.setLinearVelocity(tempVec3);

        // model
        this.animation.node.eulerAngles = tempVec3.set(0, this.rotation, 0);


        // let position = this.node.position;
        // this.node.setPosition(position.x + speed.x * deltaTime, position.y, position.z + speed.y * deltaTime);
        // this.node.eulerAngles = tempVec3.set(0, this.rotation, 0);
    }
}
