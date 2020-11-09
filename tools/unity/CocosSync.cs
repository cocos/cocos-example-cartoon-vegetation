using System;
using System.Collections.Generic;

using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;

using BestHTTP.SocketIO;

[Serializable]
class SyncAssetData
{
    public String name;
    public String uuid;
    public String path;

    public static string GetAssetData<IDataType>(UnityEngine.Object obj) where IDataType : SyncAssetData, new()
    {
        string uuid;
        long file;
        if (!AssetDatabase.TryGetGUIDAndLocalFileIdentifier(obj, out uuid, out file))
        {
            Debug.LogWarning("Can not find guid for asset.");
            return "";
        }

        Dictionary<string, SyncAssetData> assetPack;
        CocosSync.sceneData.assetsMap.TryGetValue(uuid, out assetPack);

        if (assetPack == null)
        {
            assetPack = new Dictionary<string, SyncAssetData>();
            CocosSync.sceneData.assetsMap.Add(uuid, assetPack);
        }


        SyncAssetData asset = null;
        assetPack.TryGetValue(obj.name, out asset);

        if (asset != null)
        {
            return asset.uuid;
        }

        asset = new IDataType();

        asset.uuid = uuid + "/" + obj.name;

        asset.path = AssetDatabase.GetAssetPath(obj);
        asset.path = asset.path.Replace("Assets/", "");

        asset.Sync(obj);

        assetPack.Add(obj.name, asset);
        CocosSync.sceneData.assets.Add(asset.GetData());

        return asset.uuid;
    }

    public virtual void Sync(UnityEngine.Object obj)
    {
        this.name = "cc.Asset";
    }

    public virtual string GetData()
    {
        return JsonUtility.ToJson(this);
    }
}

[Serializable]
class SyncMaterialData : SyncAssetData
{
    public override void Sync(UnityEngine.Object obj)
    {
        this.name = "cc.Material";

        Material m = obj as Material;
    }

    public override string GetData()
    {
        return JsonUtility.ToJson(this);
    }
}

class SyncMeshData : SyncAssetData
{
    public string meshName;

    public List<float> vertices = new List<float>();
    public List<float> uv = new List<float>();
    public List<float> normals = new List<float>();
    public List<float> boneWeights = new List<float>();
    public List<int> indices = new List<int>();
    public Vector3 min;
    public Vector3 max;

    public override void Sync(UnityEngine.Object obj)
    {
        this.name = "cc.Mesh";

        Mesh m = obj as Mesh;
        this.meshName = m.name;

        foreach (var v in m.vertices)
        {
            this.vertices.Add(v.x);
            this.vertices.Add(v.y);
            this.vertices.Add(v.z);
        }
        foreach (var v in m.uv)
        {
            this.uv.Add(v.x);
            this.uv.Add(v.y);
        }
        foreach (var v in m.normals)
        {
            this.normals.Add(v.x);
            this.normals.Add(v.y);
            this.normals.Add(v.z);
        }
        foreach (var v in m.boneWeights)
        {
            this.boneWeights.Add(v.weight0);
            this.boneWeights.Add(v.weight1);
            this.boneWeights.Add(v.weight2);
            this.boneWeights.Add(v.weight3);
        }
        foreach (var v in m.triangles)
        {
            this.indices.Add(v);
        }
        this.min = m.bounds.min;
        this.max = m.bounds.max;
    }

    public override string GetData()
    {
        return JsonUtility.ToJson(this);
    }
}

[Serializable]
class SyncComponentData
{
    public String uuid;
    public String name;

    public virtual string GetData()
    {
        return JsonUtility.ToJson(this);
    }
}

[Serializable]
class SyncTerrainLayer
{
    public string name;
}

[Serializable]
class SyncTerrainData : SyncComponentData
{
    // height map
    public float heightmapWidth;
    public float heightmapHeight;
    public float[] heightDatas;

    // weight map
    public List<SyncTerrainLayer> terrainLayers = new List<SyncTerrainLayer>();
    public float weightmapWidth;
    public float weightmapHeight;

    public float[] weightDatas;

    // info
    public float terrainWidth;
    public float terrainHeight;


    public override string GetData()
    {
        return JsonUtility.ToJson(this);
    }
}

[Serializable]
class SyncMeshRendererData : SyncComponentData
{
    public List<string> materilas = new List<string>();
    public string mesh = "";

    public override string GetData()
    {
        return JsonUtility.ToJson(this);
    }
}

[Serializable]
class SyncNodeData
{
    public String uuid;
    public String name;

    public Vector3 position;
    public Vector3 scale;
    public Vector3 eulerAngles;

    public List<SyncNodeData> children = new List<SyncNodeData>();
    public List<string> components = new List<string>();
}

[Serializable]
class SyncSceneData
{
    public int nodeCount = 0;
    public int componentCount = 0;
    public List<SyncNodeData> children = new List<SyncNodeData>();

    public String assetBasePath = "";
    public Dictionary<string, Dictionary<string, SyncAssetData>> assetsMap = new Dictionary<string, Dictionary<string, SyncAssetData>>();
    public List<string> assets = new List<string>();
}

class CocosSync : EditorWindow
{
    static private SocketManager Manager;
    static string address = "http://127.0.0.1:8877/socket.io/";

    public static SyncSceneData sceneData = null;


    [MenuItem("Cocos/Sync Tool")]
    static void Init()
    {
        EditorWindow.GetWindow<CocosSync>().Show();
    }

    static void CheckSocket()
    {
        if (Manager == null || Manager.State == SocketManager.States.Closed)
        {
            Manager = new SocketManager(new Uri(address));

            Manager.Socket.On(SocketIOEventTypes.Connect, (s, p, a) =>
            {
                Debug.Log("CocosSync Connected!");
            });

            Manager.Socket.On(SocketIOEventTypes.Disconnect, (s, p, a) =>
            {
                Debug.Log("CocosSync Disconnected!");
            });

            // The argument will be an Error object.
            Manager.Socket.On(SocketIOEventTypes.Error, (socket, packet, args) =>
            {
                Debug.LogError(string.Format("Error: {0}", args[0].ToString()));
            });
        }
    }

    void OnGUI()
    {
        CheckSocket();

        if (Manager.State == SocketManager.States.Opening)
        {
            GUILayout.Label("Connecting.");
            return;
        }


        if (GUILayout.Button("SyncSelect"))
        {
            SyncSelect();
        }
        if (GUILayout.Button("SyncScene"))
        {
            SyncScene();
        }
    }


    String getGuid(Transform obj)
    {
        var provider = obj.GetComponent<GuidProvider>();
        if (!provider)
        {
            provider = obj.gameObject.AddComponent<GuidProvider>();
        }

        if (obj.name.Contains("@"))
        {
            obj.name = obj.name.Split('@')[0];
        }

        return provider.guid;
    }

    void SyncSelect()
    {
        if (Selection.activeTransform == null)
        {
            return;
        }

        sceneData = new SyncSceneData();

        var now = DateTime.Now;

        SyncNodeData rootData = null;
        SyncNodeData data = null;

        Transform t = Selection.activeTransform;

        Transform curr = t;
        while (curr)
        {
            SyncNodeData pdata = null;
            if (data == null)
            {
                pdata = ExportNode(curr, true, true);
                data = pdata;
            }
            else
            {
                pdata = ExportNode(curr);
            }

            if (rootData != null)
            {
                pdata.children.Add(rootData);
            }

            rootData = pdata;
            curr = curr.parent;
        }

        sceneData.children.Add(rootData);

        sceneData.assetBasePath = Application.dataPath;

        object jsonData = JsonUtility.ToJson(sceneData);
        Manager.Socket.Emit("sync-datas", jsonData);

        sceneData = null;

        Debug.Log("End Sync: " + DateTime.Now.Subtract(now).Milliseconds.ToString());
    }

    SyncNodeData ExportNode(Transform t, bool syncComponent = false, bool syncChildren = false)
    {
        SyncNodeData data = new SyncNodeData();

        data.uuid = getGuid(t);
        data.name = t.name;
        data.position = t.localPosition;
        data.scale = t.localScale;
        data.eulerAngles = t.localEulerAngles;

        sceneData.nodeCount++;

        if (syncComponent)
        {
            foreach (var comp in t.GetComponents<Component>())
            {
                SyncComponentData compData = null;
                if (comp is Terrain)
                {
                    compData = ExportTerrain(comp as Terrain);
                }
                else if (comp is MeshRenderer)
                {
                    compData = ExportMeshRenderer(comp as MeshRenderer);
                }

                if (compData != null)
                {
                    compData.uuid = comp.GetInstanceID().ToString();
                    sceneData.componentCount++;

                    data.components.Add(compData.GetData());
                }
            }
        }

        if (syncChildren)
        {
            var maxChildCount = 10000;

            var group = t.GetComponent<LODGroup>();
            if (group)
            {
                maxChildCount = 1;
            }

            var childCount = Math.Min(t.childCount, maxChildCount);
            for (var i = 0; i < childCount; i++)
            {
                var childData = ExportNode(t.GetChild(i), syncComponent, syncChildren);
                data.children.Add(childData);
            }
        }

        return data;
    }

    SyncMeshRendererData ExportMeshRenderer(MeshRenderer comp)
    {
        SyncMeshRendererData data = new SyncMeshRendererData();
        data.name = "cc.MeshRenderer";

        foreach (var m in comp.sharedMaterials)
        {
            var uuid = SyncAssetData.GetAssetData<SyncMaterialData>(m);
            data.materilas.Add(uuid);
        }

        var filter = comp.GetComponent<MeshFilter>();
        if (filter)
        {
            data.mesh = SyncAssetData.GetAssetData<SyncMeshData>(filter.sharedMesh);
        }

        return data;
    }

    SyncTerrainData ExportTerrain(Terrain terrainObject)
    {
        SyncTerrainData data = new SyncTerrainData();
        data.name = "cc.Terrain";

        TerrainData terrain = terrainObject.terrainData;

        var terrainLayers = terrain.terrainLayers;
        var alphaMaps = terrain.GetAlphamaps(0, 0, terrain.alphamapWidth, terrain.alphamapHeight);

        for (var i = 0; i < terrainLayers.Length; i++)
        {
            SyncTerrainLayer layer = new SyncTerrainLayer();
            layer.name = terrainLayers[i].name;
            data.terrainLayers.Add(layer);
        }

        // weight datas
        int weightmapWidth = terrain.alphamapWidth;
        int weightmapHeight = terrain.alphamapHeight;

        float[] allWeightDatas = new float[weightmapWidth * weightmapHeight * terrainLayers.Length];
        for (var i = 0; i < weightmapWidth; i++)
        {
            for (var j = 0; j < weightmapHeight; j++)
            {
                for (var k = 0; k < terrainLayers.Length; k++)
                {
                    var value = alphaMaps[j, i, k];
                    if (Single.IsNaN(value))
                    {
                        value = 0;
                    }

                    int index = (i + j * weightmapWidth) * terrainLayers.Length + k;
                    allWeightDatas[index] = value;
                }
            }
        }


        // height datas
        int heightmapWidth = terrain.heightmapResolution;
        int heightmapHeight = terrain.heightmapResolution;

        var tData = terrain.GetHeights(0, 0, heightmapWidth, heightmapHeight);
        var height = terrain.size.y;

        float[] allHeightDatas = new float[heightmapWidth * heightmapHeight];
        for (var i = 0; i < heightmapWidth; i++)
        {
            for (var j = 0; j < heightmapHeight; j++)
            {
                allHeightDatas[i + j * heightmapWidth] = tData[j, i] * height;
            }
        }

        data.weightDatas = allWeightDatas;
        data.heightmapWidth = heightmapWidth;
        data.heightmapHeight = heightmapHeight;

        data.heightDatas = allHeightDatas;
        data.weightmapWidth = weightmapWidth;
        data.weightmapHeight = weightmapHeight;

        data.terrainWidth = terrain.size.x;
        data.terrainHeight = terrain.size.y;

        return data;
    }

    void SyncScene()
    {

    }

    void OnDestroy()
    {
        if (Manager != null)
        {
            Manager.Close();
            Manager = null;
        }
    }
}
