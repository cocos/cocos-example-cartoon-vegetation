// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, Vec3, Vec4, Vec2, Material, director, mat4, Mat4 } from 'cc';
import { BuoyancyPoint } from './buoyancy-point';
const { ccclass, property, type } = _decorator;

const { sin, cos, PI } = Math;

let tempVec2_1 = new Vec2;
let tempVec2_2 = new Vec2;

let tempVec3_1 = new Vec3;
let tempVec3_2 = new Vec3;

let tempWorldPos = new Vec3;
let tempForce = new Vec3;
let tempWolrdMatrix = new Mat4;


function gerstner (position: Vec3, steepness: number, wavelength: number, speed: number, direction: number, time: number, out?: Vec3): Vec3 {
    out = out || new Vec3

    direction = direction * 2. - 1.;
    tempVec2_1.set(cos(PI * direction), sin(PI * direction));
    let d = tempVec2_1.normalize();
    let s = steepness;
    let k = 2. * PI / wavelength;
    let f = k * (d.dot(tempVec2_2.set(position.x, position.z)) - speed * time);
    let a = s / k;

    return out.set(
        d.x * a * cos(f),
        a * sin(f),
        d.y * a * cos(f)
    );
}


function gerstnerWaves (p: Vec3, visuals: Vec4, directions: Vec4, outOffset: Vec3, time: number) {
    let steepness = visuals.x;
    let wavelength = visuals.y;
    let speed = visuals.z;

    outOffset.set(0, 0, 0);

    outOffset.add(gerstner(p, steepness, wavelength, speed, directions.x, time, tempVec3_1));
    outOffset.add(gerstner(p, steepness, wavelength, speed, directions.y, time, tempVec3_1));
    outOffset.add(gerstner(p, steepness, wavelength, speed, directions.z, time, tempVec3_1));
    outOffset.add(gerstner(p, steepness, wavelength, speed, directions.w, time, tempVec3_1));

    return outOffset;
}

@ccclass('BuoyancyManager')
export class BuoyancyManager extends Component {
    static _instance: BuoyancyManager | null = null;
    static get instance () {
        return this._instance;
    }

    @type(Material)
    waterMaterial: Material | null = null;

    @type(Node)
    water: Node | null = null;

    @type(BuoyancyPoint)
    points: BuoyancyPoint[] = [];

    @property
    waveForce = 10;

    @property
    waveOffset = 0;

    visuals = new Vec4;
    directions = new Vec4;

    addPoint (point: BuoyancyPoint) {
        if (this.points.indexOf(point) === -1) {
            this.points.push(point);
        }
    }
    removePoiint (point: BuoyancyPoint) {
        let index = this.points.indexOf(point);
        if (index !== -1) {
            this.points.splice(index, 1);
        }
    }

    __preload () {
        BuoyancyManager._instance = this;
    }
    onDestroy () {
        BuoyancyManager._instance = null;
    }

    start () {
        if (this.waterMaterial) {
            let visuals = this.waterMaterial.getProperty('waveVisuals');
            if (visuals) {
                this.visuals.set(visuals as Vec4);
            }

            let directions = this.waterMaterial.getProperty('waveDirections');
            if (directions) {
                this.directions.set(directions as Vec4);
            }
        }
    }

    update (deltaTime: number) {
        // Your update function goes here.

        let time = director.root?.cumulativeTime!;

        let points = this.points;
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            if (!point.body) {
                continue;
            }

            let worldPos = point.node.worldPosition;

            let waveWorldPos = tempWorldPos;
            waveWorldPos.set(worldPos.x, this.water?.worldPosition.y, worldPos.z);
            let waveOffset = gerstnerWaves(waveWorldPos, this.visuals, this.directions, tempVec3_2, time);
            waveWorldPos.add(waveOffset);

            let heightOffset = waveWorldPos.y - worldPos.y;
            if (heightOffset < this.waveOffset) {
                return;
            }

            tempForce.set(Vec3.UP);
            tempForce.multiplyScalar(this.waveForce * point.body.mass * point.forceMultiply * (1 + heightOffset));

            Mat4.invert(tempWolrdMatrix, point.body.node.worldMatrix);
            let localPoint = Vec3.transformMat4(tempVec3_1, worldPos, tempWolrdMatrix);

            point.body.applyForce(tempForce, localPoint);
        }

    }
}
