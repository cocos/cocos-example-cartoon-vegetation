import { Component } from "cc";

export interface SyncComponentData {
    uuid: string;
    name: string;
}

export class SyncComponent {
    static clsName = 'cc.Component';

    static import (comp: Component, data: SyncComponentData) {
    }
}

export let classes: Map<string, typeof SyncComponent> = new Map();
export function register(cls: typeof SyncComponent) {
    classes.set(cls.clsName, cls);
}