// Made with Amplify Shader Editor
// Available at the Unity Asset Store - http://u3d.as/y3X 
Shader "Raygeas/AZURE Vegetation"
{
	Properties
	{
		_Color1("Color 1", Color) = (1,1,1,0)
		_Color2("Color 2", Color) = (0,0,0,0)
		_Cutoff("Cutoff", Range( 0 , 1)) = 0.35
		_Smoothness("Smoothness", Range( 0 , 1)) = 0
		_Texture00("Vegetation Texture", 2D) = "white" {}
		_SnowMask("Snow Mask", 2D) = "white" {}
		[Toggle(_COLOR2ENABLE_ON)] _Color2Enable("- COLOR 2", Float) = 0
		[KeywordEnum(Vertex_Position_Based,UV_Based)] _Color2OverlayType("Color 2 Overlay Type", Float) = 0
		_Color2Level("Color 2 Level", Float) = 0
		_Color2Fade("Color 2 Fade", Range( -1 , 1)) = 0.5
		[Toggle(_SNOW_ON)] _SNOW("- SNOW", Float) = 0
		[KeywordEnum(World_Normal_Based,UV_Based)] _SnowOverlayType("Snow Overlay Type", Float) = 0
		_SnowAmount("Snow Amount", Range( 0 , 1)) = 0.5
		_SnowFade("Snow Fade", Range( 0 , 1)) = 0.3
		[Toggle(_WIND_ON)] _WIND("- WIND", Float) = 1
		_WindForce("Wind Force", Range( 0 , 1)) = 0.3
		_WindWavesScale("Wind Waves Scale", Range( 0 , 1)) = 0.25
		_WindSpeed("Wind Speed", Range( 0 , 1)) = 0.5
		[Toggle(_FIXTHEBASEOFFOLIAGE_ON)] _Fixthebaseoffoliage("Fix the base of foliage", Float) = 0
		[Header(Translucency)]
		_Translucency("Strength", Range( 0 , 50)) = 1
		_TransNormalDistortion("Normal Distortion", Range( 0 , 1)) = 0.1
		_TransScattering("Scaterring Falloff", Range( 1 , 50)) = 2
		_TransDirect("Direct", Range( 0 , 1)) = 1
		_TransAmbient("Ambient", Range( 0 , 1)) = 0.2
		_TransShadow("Shadow", Range( 0 , 1)) = 0.9
		[HideInInspector] _texcoord( "", 2D ) = "white" {}
		[HideInInspector] __dirty( "", Int ) = 1
	}

	SubShader
	{
		Tags{ "RenderType" = "TransparentCutout"  "Queue" = "AlphaTest+0" "IgnoreProjector" = "True" }
		Cull Off
		CGPROGRAM
		#include "UnityShaderVariables.cginc"
		#include "UnityPBSLighting.cginc"
		#pragma target 3.0
		#pragma shader_feature_local _WIND_ON
		#pragma shader_feature_local _FIXTHEBASEOFFOLIAGE_ON
		#pragma shader_feature_local _SNOW_ON
		#pragma shader_feature_local _COLOR2ENABLE_ON
		#pragma shader_feature_local _COLOR2OVERLAYTYPE_VERTEX_POSITION_BASED _COLOR2OVERLAYTYPE_UV_BASED
		#pragma shader_feature_local _SNOWOVERLAYTYPE_WORLD_NORMAL_BASED _SNOWOVERLAYTYPE_UV_BASED
		#pragma surface surf StandardCustom keepalpha addshadow fullforwardshadows exclude_path:deferred nolightmap  nodynlightmap nodirlightmap dithercrossfade vertex:vertexDataFunc 
		struct Input
		{
			float3 worldPos;
			float2 uv_texcoord;
			float3 worldNormal;
		};

		struct SurfaceOutputStandardCustom
		{
			half3 Albedo;
			half3 Normal;
			half3 Emission;
			half Metallic;
			half Smoothness;
			half Occlusion;
			half Alpha;
			half3 Translucency;
		};

		uniform float _WindSpeed;
		uniform float _WindWavesScale;
		uniform float _WindForce;
		uniform float4 _Color1;
		uniform sampler2D _Texture00;
		uniform float4 _Texture00_ST;
		uniform float4 _Color2;
		uniform float _Color2Level;
		uniform float _Color2Fade;
		uniform float _SnowAmount;
		uniform sampler2D _SnowMask;
		uniform float4 _SnowMask_ST;
		uniform float _SnowFade;
		uniform float _Smoothness;
		uniform half _Translucency;
		uniform half _TransNormalDistortion;
		uniform half _TransScattering;
		uniform half _TransDirect;
		uniform half _TransAmbient;
		uniform half _TransShadow;
		uniform float _Cutoff;


		float3 mod3D289( float3 x ) { return x - floor( x / 289.0 ) * 289.0; }

		float4 mod3D289( float4 x ) { return x - floor( x / 289.0 ) * 289.0; }

		float4 permute( float4 x ) { return mod3D289( ( x * 34.0 + 1.0 ) * x ); }

		float4 taylorInvSqrt( float4 r ) { return 1.79284291400159 - r * 0.85373472095314; }

		float snoise( float3 v )
		{
			const float2 C = float2( 1.0 / 6.0, 1.0 / 3.0 );
			float3 i = floor( v + dot( v, C.yyy ) );
			float3 x0 = v - i + dot( i, C.xxx );
			float3 g = step( x0.yzx, x0.xyz );
			float3 l = 1.0 - g;
			float3 i1 = min( g.xyz, l.zxy );
			float3 i2 = max( g.xyz, l.zxy );
			float3 x1 = x0 - i1 + C.xxx;
			float3 x2 = x0 - i2 + C.yyy;
			float3 x3 = x0 - 0.5;
			i = mod3D289( i);
			float4 p = permute( permute( permute( i.z + float4( 0.0, i1.z, i2.z, 1.0 ) ) + i.y + float4( 0.0, i1.y, i2.y, 1.0 ) ) + i.x + float4( 0.0, i1.x, i2.x, 1.0 ) );
			float4 j = p - 49.0 * floor( p / 49.0 );  // mod(p,7*7)
			float4 x_ = floor( j / 7.0 );
			float4 y_ = floor( j - 7.0 * x_ );  // mod(j,N)
			float4 x = ( x_ * 2.0 + 0.5 ) / 7.0 - 1.0;
			float4 y = ( y_ * 2.0 + 0.5 ) / 7.0 - 1.0;
			float4 h = 1.0 - abs( x ) - abs( y );
			float4 b0 = float4( x.xy, y.xy );
			float4 b1 = float4( x.zw, y.zw );
			float4 s0 = floor( b0 ) * 2.0 + 1.0;
			float4 s1 = floor( b1 ) * 2.0 + 1.0;
			float4 sh = -step( h, 0.0 );
			float4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
			float4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
			float3 g0 = float3( a0.xy, h.x );
			float3 g1 = float3( a0.zw, h.y );
			float3 g2 = float3( a1.xy, h.z );
			float3 g3 = float3( a1.zw, h.w );
			float4 norm = taylorInvSqrt( float4( dot( g0, g0 ), dot( g1, g1 ), dot( g2, g2 ), dot( g3, g3 ) ) );
			g0 *= norm.x;
			g1 *= norm.y;
			g2 *= norm.z;
			g3 *= norm.w;
			float4 m = max( 0.6 - float4( dot( x0, x0 ), dot( x1, x1 ), dot( x2, x2 ), dot( x3, x3 ) ), 0.0 );
			m = m* m;
			m = m* m;
			float4 px = float4( dot( x0, g0 ), dot( x1, g1 ), dot( x2, g2 ), dot( x3, g3 ) );
			return 42.0 * dot( m, px);
		}


		void vertexDataFunc( inout appdata_full v, out Input o )
		{
			UNITY_INITIALIZE_OUTPUT( Input, o );
			float3 ase_worldPos = mul( unity_ObjectToWorld, v.vertex );
			float mulTime34 = _Time.y * ( _WindSpeed * 5 );
			float simplePerlin3D35 = snoise( ( ase_worldPos + mulTime34 )*_WindWavesScale );
			float temp_output_231_0 = ( simplePerlin3D35 * 0.01 );
			#ifdef _FIXTHEBASEOFFOLIAGE_ON
				float staticSwitch376 = ( temp_output_231_0 * pow( v.texcoord.xy.y , 2.0 ) );
			#else
				float staticSwitch376 = temp_output_231_0;
			#endif
			#ifdef _WIND_ON
				float staticSwitch341 = ( staticSwitch376 * ( _WindForce * 30 ) );
			#else
				float staticSwitch341 = 0.0;
			#endif
			float Wind191 = staticSwitch341;
			float3 temp_cast_0 = (Wind191).xxx;
			v.vertex.xyz += temp_cast_0;
		}

		inline half4 LightingStandardCustom(SurfaceOutputStandardCustom s, half3 viewDir, UnityGI gi )
		{
			#if !DIRECTIONAL
			float3 lightAtten = gi.light.color;
			#else
			float3 lightAtten = lerp( _LightColor0.rgb, gi.light.color, _TransShadow );
			#endif
			half3 lightDir = gi.light.dir + s.Normal * _TransNormalDistortion;
			half transVdotL = pow( saturate( dot( viewDir, -lightDir ) ), _TransScattering );
			half3 translucency = lightAtten * (transVdotL * _TransDirect + gi.indirect.diffuse * _TransAmbient) * s.Translucency;
			half4 c = half4( s.Albedo * translucency * _Translucency, 0 );

			SurfaceOutputStandard r;
			r.Albedo = s.Albedo;
			r.Normal = s.Normal;
			r.Emission = s.Emission;
			r.Metallic = s.Metallic;
			r.Smoothness = s.Smoothness;
			r.Occlusion = s.Occlusion;
			r.Alpha = s.Alpha;
			return LightingStandard (r, viewDir, gi) + c;
		}

		inline void LightingStandardCustom_GI(SurfaceOutputStandardCustom s, UnityGIInput data, inout UnityGI gi )
		{
			#if defined(UNITY_PASS_DEFERRED) && UNITY_ENABLE_REFLECTION_BUFFERS
				gi = UnityGlobalIllumination(data, s.Occlusion, s.Normal);
			#else
				UNITY_GLOSSY_ENV_FROM_SURFACE( g, s, data );
				gi = UnityGlobalIllumination( data, s.Occlusion, s.Normal, g );
			#endif
		}

		void surf( Input i , inout SurfaceOutputStandardCustom o )
		{
			float2 uv_Texture00 = i.uv_texcoord * _Texture00_ST.xy + _Texture00_ST.zw;
			float4 tex2DNode1 = tex2D( _Texture00, uv_Texture00 );
			float4 temp_output_10_0 = ( _Color1 * tex2DNode1 );
			float3 ase_vertex3Pos = mul( unity_WorldToObject, float4( i.worldPos , 1 ) );
			#if defined(_COLOR2OVERLAYTYPE_VERTEX_POSITION_BASED)
				float staticSwitch360 = ase_vertex3Pos.y;
			#elif defined(_COLOR2OVERLAYTYPE_UV_BASED)
				float staticSwitch360 = i.uv_texcoord.y;
			#else
				float staticSwitch360 = ase_vertex3Pos.y;
			#endif
			float Color2Mask335 = saturate( ( ( staticSwitch360 + _Color2Level ) * ( _Color2Fade * 2 ) ) );
			float4 lerpResult332 = lerp( temp_output_10_0 , ( _Color2 * tex2D( _Texture00, uv_Texture00 ) ) , Color2Mask335);
			#ifdef _COLOR2ENABLE_ON
				float4 staticSwitch340 = lerpResult332;
			#else
				float4 staticSwitch340 = temp_output_10_0;
			#endif
			float4 color288 = IsGammaSpace() ? float4(0.8962264,0.8962264,0.8962264,0) : float4(0.7799658,0.7799658,0.7799658,0);
			float3 ase_worldNormal = i.worldNormal;
			#if defined(_SNOWOVERLAYTYPE_WORLD_NORMAL_BASED)
				float staticSwitch390 = ase_worldNormal.y;
			#elif defined(_SNOWOVERLAYTYPE_UV_BASED)
				float staticSwitch390 = i.uv_texcoord.y;
			#else
				float staticSwitch390 = ase_worldNormal.y;
			#endif
			float2 uv_SnowMask = i.uv_texcoord * _SnowMask_ST.xy + _SnowMask_ST.zw;
			float saferPower354 = max( ( ( staticSwitch390 * ( _SnowAmount * 5 ) ) - tex2D( _SnowMask, uv_SnowMask ).r ) , 0.0001 );
			float SnowMask314 = saturate( pow( saferPower354 , ( _SnowFade * 20 ) ) );
			float4 lerpResult295 = lerp( staticSwitch340 , ( color288 * tex2D( _Texture00, uv_Texture00 ) ) , SnowMask314);
			#ifdef _SNOW_ON
				float4 staticSwitch342 = lerpResult295;
			#else
				float4 staticSwitch342 = staticSwitch340;
			#endif
			float4 Albedo259 = staticSwitch342;
			o.Albedo = Albedo259.rgb;
			o.Smoothness = _Smoothness;
			float3 temp_cast_1 = (1.0).xxx;
			o.Translucency = temp_cast_1;
			o.Alpha = 1;
			float Alpha263 = tex2DNode1.a;
			clip( Alpha263 - _Cutoff );
		}

		ENDCG
	}
	Fallback "Diffuse"
}
/*ASEBEGIN
Version=18100
245;73;1802;928;5775.199;1764.761;1;True;False
Node;AmplifyShaderEditor.CommentaryNode;336;-3546.929,-476.2514;Inherit;False;1474.883;565.8699;;10;310;335;334;382;248;377;360;309;361;391;Color 2 Mask;1,1,1,1;0;0
Node;AmplifyShaderEditor.PosVertexDataNode;309;-3465.548,-405.9526;Inherit;False;0;0;5;FLOAT3;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.CommentaryNode;66;-5466.88,434.7253;Inherit;False;2621.259;742.2787;;18;191;341;188;56;345;190;36;376;359;356;231;35;358;357;182;228;34;344;Wind;1,1,1,1;0;0
Node;AmplifyShaderEditor.TextureCoordinatesNode;361;-3500.829,-247.2093;Inherit;False;0;-1;2;3;2;SAMPLER2D;;False;0;FLOAT2;1,1;False;1;FLOAT2;0,0;False;5;FLOAT2;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.CommentaryNode;313;-5466.776,-482.5264;Inherit;False;1858.103;826.4135;;13;305;314;354;349;350;291;362;299;363;322;390;312;352;Snow Mask;1,1,1,1;0;0
Node;AmplifyShaderEditor.RangedFloatNode;36;-5432.24,691.3121;Inherit;False;Property;_WindSpeed;Wind Speed;17;0;Create;True;0;0;False;0;False;0.5;0.2;0;1;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;248;-3156.202,-40.47443;Inherit;False;Property;_Color2Fade;Color 2 Fade;9;0;Create;True;0;0;False;0;False;0.5;0.82;-1;1;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;310;-3049.677,-120.8673;Inherit;False;Property;_Color2Level;Color 2 Level;8;0;Create;True;0;0;False;0;False;0;-0.24;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.TextureCoordinatesNode;352;-5429.32,-234.8225;Inherit;False;0;-1;2;3;2;SAMPLER2D;;False;0;FLOAT2;1,1;False;1;FLOAT2;0,0;False;5;FLOAT2;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.StaticSwitch;360;-3241.447,-302.6742;Inherit;False;Property;_Color2OverlayType;Color 2 Overlay Type;7;0;Create;True;0;0;False;0;False;0;0;0;True;;KeywordEnum;2;Vertex_Position_Based;UV_Based;Create;True;9;1;FLOAT;0;False;0;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;4;FLOAT;0;False;5;FLOAT;0;False;6;FLOAT;0;False;7;FLOAT;0;False;8;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.WorldNormalVector;312;-5398.226,-429.1961;Inherit;False;False;1;0;FLOAT3;0,0,1;False;4;FLOAT3;0;FLOAT;1;FLOAT;2;FLOAT;3
Node;AmplifyShaderEditor.RangedFloatNode;291;-5263.6,-91.42583;Inherit;False;Property;_SnowAmount;Snow Amount;12;0;Create;True;0;0;False;0;False;0.5;0.59;0;1;0;1;FLOAT;0
Node;AmplifyShaderEditor.ScaleNode;391;-2855.358,-37.0037;Inherit;False;2;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.ScaleNode;344;-5135.242,696.7037;Inherit;False;5;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.StaticSwitch;390;-5130.754,-301.3329;Inherit;False;Property;_SnowOverlayType;Snow Overlay Type;11;0;Create;True;0;0;False;0;False;0;0;0;True;;KeywordEnum;2;World_Normal_Based;UV_Based;Create;True;9;1;FLOAT;0;False;0;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;4;FLOAT;0;False;5;FLOAT;0;False;6;FLOAT;0;False;7;FLOAT;0;False;8;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleAddOpNode;377;-2852.993,-219.3139;Inherit;False;2;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.ScaleNode;322;-4946.734,-84.80173;Inherit;False;5;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;349;-4722.126,230.9095;Inherit;False;Property;_SnowFade;Snow Fade;13;0;Create;True;0;0;False;0;False;0.3;0.808;0;1;0;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleTimeNode;34;-4965.56,696.4692;Inherit;False;1;0;FLOAT;1;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;382;-2654.732,-130.5992;Inherit;False;2;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.CommentaryNode;262;-5464.19,-1655.891;Inherit;False;2411.291;1071.411;;19;259;374;370;288;315;342;295;263;340;332;337;10;367;1;247;366;3;368;369;Albedo;1,1,1,1;0;0
Node;AmplifyShaderEditor.SamplerNode;363;-4813.988,33.03799;Inherit;True;Property;_SnowMask;Snow Mask;5;0;Create;True;0;0;False;0;False;-1;None;6256982f10c8bb141ac4d83ddbea3bf2;True;0;False;white;Auto;False;Object;-1;Auto;Texture2D;6;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;299;-4731.806,-198.0521;Inherit;True;2;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.WorldPosInputsNode;228;-4965.367,528.4799;Inherit;False;0;4;FLOAT3;0;FLOAT;1;FLOAT;2;FLOAT;3
Node;AmplifyShaderEditor.SimpleSubtractOpNode;362;-4401.161,-84.57065;Inherit;False;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SaturateNode;334;-2471.036,-131.0528;Inherit;False;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.TexturePropertyNode;368;-5417.441,-1152.255;Inherit;True;Property;_Texture00;Vegetation Texture;4;0;Create;False;0;0;False;0;False;None;603a681375cacca45ae65a756606e807;False;white;Auto;Texture2D;-1;0;1;SAMPLER2D;0
Node;AmplifyShaderEditor.SimpleAddOpNode;182;-4719.293,608.7031;Inherit;False;2;2;0;FLOAT3;0,0,0;False;1;FLOAT;0;False;1;FLOAT3;0
Node;AmplifyShaderEditor.RangedFloatNode;190;-4869.377,811.9411;Inherit;False;Property;_WindWavesScale;Wind Waves Scale;16;0;Create;True;0;0;False;0;False;0.25;0.411;0;1;0;1;FLOAT;0
Node;AmplifyShaderEditor.ScaleNode;350;-4408.739,236.1816;Inherit;False;20;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.ColorNode;3;-5014.373,-1548.767;Inherit;False;Property;_Color1;Color 1;0;0;Create;True;0;0;False;0;False;1,1,1,0;0.1992481,0.5,0.4172932,0;True;0;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.RegisterLocalVarNode;335;-2281.603,-136.4185;Inherit;False;Color2Mask;-1;True;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.NoiseGeneratorNode;35;-4506.449,699.5806;Inherit;True;Simplex3D;False;False;2;0;FLOAT3;0,0,0;False;1;FLOAT;0.4;False;1;FLOAT;0
Node;AmplifyShaderEditor.SamplerNode;366;-5095.275,-968.4368;Inherit;True;Property;_TextureSample0;Texture Sample 0;18;0;Create;True;0;0;False;0;False;-1;None;None;True;0;False;white;Auto;False;Instance;-1;Auto;Texture2D;6;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.ColorNode;247;-5011.654,-1154.948;Inherit;False;Property;_Color2;Color 2;1;0;Create;True;0;0;False;0;False;0,0,0,0;0.02352945,0.2,0.02000001,0;True;0;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SamplerNode;1;-5096.108,-1359.212;Inherit;True;Property;_LeavesTexture;Leaves Texture;0;0;Create;True;0;0;False;0;False;-1;None;None;True;0;False;white;Auto;False;Instance;-1;Auto;Texture2D;6;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.PowerNode;354;-4189.933,66.05038;Inherit;False;True;2;0;FLOAT;0;False;1;FLOAT;1;False;1;FLOAT;0
Node;AmplifyShaderEditor.TextureCoordinatesNode;357;-4483.792,940.533;Inherit;False;0;-1;2;3;2;SAMPLER2D;;False;0;FLOAT2;1,1;False;1;FLOAT2;0,0;False;5;FLOAT2;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.RangedFloatNode;358;-4405.196,1070.673;Inherit;False;Constant;_Float0;Float 0;14;0;Create;True;0;0;False;0;False;2;2;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.PowerNode;356;-4198.264,960.5025;Inherit;False;False;2;0;FLOAT;0;False;1;FLOAT;1;False;1;FLOAT;0
Node;AmplifyShaderEditor.GetLocalVarNode;337;-4712.364,-1235.849;Inherit;False;335;Color2Mask;1;0;OBJECT;;False;1;FLOAT;0
Node;AmplifyShaderEditor.WireNode;374;-5117.086,-782.7536;Inherit;False;1;0;SAMPLER2D;;False;1;SAMPLER2D;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;10;-4691.66,-1459.553;Inherit;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.ScaleNode;231;-4188.372,703.8373;Inherit;False;0.01;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SaturateNode;305;-4012.858,65.51949;Inherit;False;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;367;-4694.844,-1066.109;Inherit;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;359;-3989.254,821.5805;Inherit;False;2;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.ColorNode;288;-4408.717,-1037.921;Inherit;False;Constant;_SnowColor;Snow Color;12;0;Create;True;0;0;False;0;False;0.8962264,0.8962264,0.8962264,0;1,1,1,0;True;0;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.LerpOp;332;-4425.198,-1279.194;Inherit;True;3;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;2;FLOAT;0;False;1;COLOR;0
Node;AmplifyShaderEditor.RegisterLocalVarNode;314;-3844.451,61.15887;Inherit;False;SnowMask;-1;True;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;56;-3952.269,977.8912;Inherit;False;Property;_WindForce;Wind Force;15;0;Create;True;0;0;False;0;False;0.3;0.48;0;1;0;1;FLOAT;0
Node;AmplifyShaderEditor.SamplerNode;369;-4497.308,-839.4506;Inherit;True;Property;_TextureSample1;Texture Sample 1;18;0;Create;True;0;0;False;0;False;-1;None;None;True;0;False;white;Auto;False;Instance;-1;Auto;Texture2D;6;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.ScaleNode;345;-3665.352,982.3984;Inherit;False;30;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.GetLocalVarNode;315;-4022.688,-1236.048;Inherit;False;314;SnowMask;1;0;OBJECT;;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;370;-4094.115,-942.3407;Inherit;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.StaticSwitch;340;-4093.219,-1460.588;Inherit;False;Property;_Color2Enable;- COLOR 2;6;0;Create;False;0;0;False;0;False;0;0;0;True;;Toggle;2;Key0;Key1;Create;True;9;1;COLOR;0,0,0,0;False;0;COLOR;0,0,0,0;False;2;COLOR;0,0,0,0;False;3;COLOR;0,0,0,0;False;4;COLOR;0,0,0,0;False;5;COLOR;0,0,0,0;False;6;COLOR;0,0,0,0;False;7;COLOR;0,0,0,0;False;8;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.StaticSwitch;376;-3795.695,700.9271;Inherit;False;Property;_Fixthebaseoffoliage;Fix the base of foliage;18;0;Create;True;0;0;False;0;False;0;0;0;True;;Toggle;2;Key0;Key1;Create;True;9;1;FLOAT;0;False;0;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;4;FLOAT;0;False;5;FLOAT;0;False;6;FLOAT;0;False;7;FLOAT;0;False;8;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.LerpOp;295;-3802.312,-1277.959;Inherit;True;3;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;2;FLOAT;0;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;188;-3463.908,823.2846;Inherit;False;2;2;0;FLOAT;0;False;1;FLOAT;-1;False;1;FLOAT;0
Node;AmplifyShaderEditor.StaticSwitch;342;-3511.394,-1460.543;Inherit;False;Property;_SNOW;- SNOW;10;0;Create;True;0;0;False;0;False;0;0;0;True;;Toggle;2;Key0;Key1;Create;True;9;1;COLOR;0,0,0,0;False;0;COLOR;0,0,0,0;False;2;COLOR;0,0,0,0;False;3;COLOR;0,0,0,0;False;4;COLOR;0,0,0,0;False;5;COLOR;0,0,0,0;False;6;COLOR;0,0,0,0;False;7;COLOR;0,0,0,0;False;8;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.StaticSwitch;341;-3275.733,794.1859;Inherit;False;Property;_WIND;- WIND;14;0;Create;True;0;0;False;0;False;0;1;1;True;;Toggle;2;Key0;Key1;Create;True;9;1;FLOAT;0;False;0;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;4;FLOAT;0;False;5;FLOAT;0;False;6;FLOAT;0;False;7;FLOAT;0;False;8;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.RegisterLocalVarNode;191;-3060.489,793.7185;Inherit;False;Wind;-1;True;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.RegisterLocalVarNode;263;-4723.248,-1318.107;Inherit;False;Alpha;-1;True;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.RegisterLocalVarNode;259;-3275.563,-1459.255;Inherit;False;Albedo;-1;True;1;0;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.RangedFloatNode;152;-2653.891,-1179.921;Inherit;False;Property;_Smoothness;Smoothness;3;0;Create;True;0;0;False;0;False;0;0;0;1;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;156;-2652.326,-1265.964;Inherit;False;Property;_Cutoff;Cutoff;2;0;Create;True;0;0;False;0;False;0.35;0.45;0;1;0;1;FLOAT;0
Node;AmplifyShaderEditor.GetLocalVarNode;267;-2547.004,-1005.729;Inherit;False;263;Alpha;1;0;OBJECT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.GetLocalVarNode;236;-2545.864,-917.1938;Inherit;False;191;Wind;1;0;OBJECT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;212;-2551.975,-1094.695;Inherit;False;Constant;_Translucency;Translucency;14;0;Create;True;0;0;False;0;False;1;1;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.GetLocalVarNode;375;-2547.872,-1353.998;Inherit;False;259;Albedo;1;0;OBJECT;;False;1;COLOR;0
Node;AmplifyShaderEditor.StandardSurfaceOutputNode;151;-2324.639,-1306.939;Float;False;True;-1;2;;0;0;Standard;Raygeas/AZURE Vegetation;False;False;False;False;False;False;True;True;True;False;False;False;True;False;True;False;False;False;False;False;True;Off;0;False;-1;0;False;-1;False;0;False;-1;0;False;-1;False;0;Masked;0.45;True;True;0;False;TransparentCutout;;AlphaTest;ForwardOnly;14;all;True;True;True;True;0;False;-1;False;0;False;-1;255;False;-1;255;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;False;2;15;10;25;False;0.5;True;0;5;False;-1;10;False;-1;0;5;False;-1;10;False;-1;0;False;-1;0;False;-1;0;False;0;0,0,0,0;VertexOffset;True;False;Cylindrical;True;Relative;0;;-1;19;-1;-1;0;False;0;0;False;-1;-1;0;True;156;0;0;0;False;0.1;False;-1;0;False;-1;16;0;FLOAT3;0,0,0;False;1;FLOAT3;0,0,0;False;2;FLOAT3;0,0,0;False;3;FLOAT;0;False;4;FLOAT;0;False;5;FLOAT;0;False;6;FLOAT3;0,0,0;False;7;FLOAT3;0,0,0;False;8;FLOAT;0;False;9;FLOAT;0;False;10;FLOAT;0;False;13;FLOAT3;0,0,0;False;11;FLOAT3;0,0,0;False;12;FLOAT3;0,0,0;False;14;FLOAT4;0,0,0,0;False;15;FLOAT3;0,0,0;False;0
WireConnection;360;1;309;2
WireConnection;360;0;361;2
WireConnection;391;0;248;0
WireConnection;344;0;36;0
WireConnection;390;1;312;2
WireConnection;390;0;352;2
WireConnection;377;0;360;0
WireConnection;377;1;310;0
WireConnection;322;0;291;0
WireConnection;34;0;344;0
WireConnection;382;0;377;0
WireConnection;382;1;391;0
WireConnection;299;0;390;0
WireConnection;299;1;322;0
WireConnection;362;0;299;0
WireConnection;362;1;363;1
WireConnection;334;0;382;0
WireConnection;182;0;228;0
WireConnection;182;1;34;0
WireConnection;350;0;349;0
WireConnection;335;0;334;0
WireConnection;35;0;182;0
WireConnection;35;1;190;0
WireConnection;366;0;368;0
WireConnection;1;0;368;0
WireConnection;354;0;362;0
WireConnection;354;1;350;0
WireConnection;356;0;357;2
WireConnection;356;1;358;0
WireConnection;374;0;368;0
WireConnection;10;0;3;0
WireConnection;10;1;1;0
WireConnection;231;0;35;0
WireConnection;305;0;354;0
WireConnection;367;0;247;0
WireConnection;367;1;366;0
WireConnection;359;0;231;0
WireConnection;359;1;356;0
WireConnection;332;0;10;0
WireConnection;332;1;367;0
WireConnection;332;2;337;0
WireConnection;314;0;305;0
WireConnection;369;0;374;0
WireConnection;345;0;56;0
WireConnection;370;0;288;0
WireConnection;370;1;369;0
WireConnection;340;1;10;0
WireConnection;340;0;332;0
WireConnection;376;1;231;0
WireConnection;376;0;359;0
WireConnection;295;0;340;0
WireConnection;295;1;370;0
WireConnection;295;2;315;0
WireConnection;188;0;376;0
WireConnection;188;1;345;0
WireConnection;342;1;340;0
WireConnection;342;0;295;0
WireConnection;341;0;188;0
WireConnection;191;0;341;0
WireConnection;263;0;1;4
WireConnection;259;0;342;0
WireConnection;151;0;375;0
WireConnection;151;4;152;0
WireConnection;151;7;212;0
WireConnection;151;10;267;0
WireConnection;151;11;236;0
ASEEND*/
//CHKSM=E5E11EB03FC2E83795D21B2019C51E68C49BF480