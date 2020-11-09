import { Vec3 } from "cc";
import { SyncMeshData } from "../asset/mesh";
import { base642arraybuffer } from "./editor";


export function toGltfMesh (mesh: SyncMeshData) {
    let gltf = {
        "asset": {
            "generator": "Khronos glTF Blender I/O v1.2.75",
            "version": "2.0"
        },
        "meshes": [
            {
                "name": mesh.meshName,
                "primitives": [
                    {
                        "attributes": {
                            "POSITION": 0,
                            "NORMAL": 1,
                            "TEXCOORD_0": 2
                        },
                        "indices": 3,
                        "mode": 4
                    }
                ]
            }
        ],
        "accessors": [
            {
                "bufferView": 0,
                "componentType": 5126,
                "count": 24,
                "type": "VEC3",
                "max": [
                    1,
                    1,
                    1
                ],
                "min": [
                    -1,
                    -1,
                    -1
                ],
            },
            {
                "bufferView": 1,
                "componentType": 5126,
                "count": 24,
                "type": "VEC3"
            },
            {
                "bufferView": 2,
                "componentType": 5126,
                "count": 24,
                "type": "VEC2"
            },
            {
                "bufferView": 3,
                "componentType": 5123,
                "count": 36,
                "type": "SCALAR"
            }
        ],
        "bufferViews": [
            {
                "buffer": 0,
                "byteLength": 288,
                "byteOffset": 0
            },
            {
                "buffer": 0,
                "byteLength": 288,
                "byteOffset": 288
            },
            {
                "buffer": 0,
                "byteLength": 192,
                "byteOffset": 576
            },
            {
                "buffer": 0,
                "byteLength": 72,
                "byteOffset": 768
            }
        ],
        "buffers": [
            {
                "byteLength": 840,
                "uri": "data:application/octet-stream;base64,AACAvwAAgD8AAIC/AACAvwAAgL8AAIC/AACAvwAAgL8AAIA/AACAvwAAgD8AAIA/AACAPwAAgD8AAIC/AACAPwAAgL8AAIC/AACAvwAAgL8AAIC/AACAvwAAgD8AAIC/AACAPwAAgD8AAIA/AACAPwAAgL8AAIA/AACAPwAAgL8AAIC/AACAPwAAgD8AAIC/AACAvwAAgD8AAIA/AACAvwAAgL8AAIA/AACAPwAAgL8AAIA/AACAPwAAgD8AAIA/AACAvwAAgL8AAIA/AACAvwAAgL8AAIC/AACAPwAAgL8AAIC/AACAPwAAgL8AAIA/AACAPwAAgD8AAIA/AACAPwAAgD8AAIC/AACAvwAAgD8AAIC/AACAvwAAgD8AAIA/AACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAACAvwAAAAAAAAAAAAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AAAAAAAAAAAAAIC/AACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAACAPwAAAAAAAAAAAAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAAAAAAIA/AAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAAAAAAAAgL8AAACAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAAAAAAgD8AAAAAAAAgPwAAQD8AAMA+AABAPwAAwD4AAIA/AAAgPwAAgD8AACA/AAAAPwAAwD4AAAA/AADAPgAAQD8AACA/AABAPwAAID8AAIA+AADAPgAAgD4AAMA+AAAAPwAAID8AAAA/AAAgPwAAAAAAAMA+AAAAAAAAwD4AAIA+AAAgPwAAgD4AAAA+AACAPgAAAD4AAAA/AADAPgAAAD8AAMA+AACAPgAAID8AAIA+AAAgPwAAAD8AAGA/AAAAPwAAYD8AAIA+AAABAAIAAAACAAMABAAFAAYABAAGAAcACAAJAAoACAAKAAsADAANAA4ADAAOAA8AEAARABIAEAASABMAFAAVABYAFAAWABcA"
            }
        ]
    }

    gltf.meshes[0].primitives[0].mode = 4;

    let posAcc = gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION];
    let norAcc = gltf.accessors[gltf.meshes[0].primitives[0].attributes.NORMAL];
    let uvAcc = gltf.accessors[gltf.meshes[0].primitives[0].attributes.TEXCOORD_0];
    let indicesAcc = gltf.accessors[gltf.meshes[0].primitives[0].indices];

    let { vertices, uv, normals, indices } = mesh;

    Vec3.toArray(posAcc.min as any, mesh.min);
    Vec3.toArray(posAcc.max as any, mesh.max);

    posAcc.count = vertices.length / 3;
    norAcc.count = normals.length / 3;
    uvAcc.count = uv.length / 2;
    indicesAcc.count = indices.length;

    let byteOffset = 0;
    gltf.bufferViews[posAcc.bufferView].byteOffset = byteOffset;
    gltf.bufferViews[posAcc.bufferView].byteLength = vertices.length * 4;
    byteOffset += vertices.length * 4;

    gltf.bufferViews[norAcc.bufferView].byteOffset = byteOffset;
    gltf.bufferViews[norAcc.bufferView].byteLength = normals.length * 4;
    byteOffset += normals.length * 4;

    gltf.bufferViews[uvAcc.bufferView].byteOffset = byteOffset;
    gltf.bufferViews[uvAcc.bufferView].byteLength = uv.length * 4;
    byteOffset += uv.length * 4;

    gltf.bufferViews[indicesAcc.bufferView].byteOffset = byteOffset;
    gltf.bufferViews[indicesAcc.bufferView].byteLength = indices.length * 2;
    byteOffset += indices.length * 2;

    let buffer = new ArrayBuffer(byteOffset);
    let float32Buffer = new Float32Array(buffer, 0, gltf.bufferViews[indicesAcc.bufferView].byteOffset / 4);
    let uint16Buffer = new Uint16Array(buffer);

    float32Buffer.set(vertices, gltf.bufferViews[posAcc.bufferView].byteOffset / 4);
    float32Buffer.set(normals, gltf.bufferViews[norAcc.bufferView].byteOffset / 4);
    float32Buffer.set(uv, gltf.bufferViews[uvAcc.bufferView].byteOffset / 4);
    uint16Buffer.set(indices, gltf.bufferViews[indicesAcc.bufferView].byteOffset / 2);

    gltf.buffers[0].byteLength = buffer.byteLength;
    gltf.buffers[0].uri = 'data:application/octet-stream;base64,' + base642arraybuffer.encode(buffer);

    return gltf;
}
