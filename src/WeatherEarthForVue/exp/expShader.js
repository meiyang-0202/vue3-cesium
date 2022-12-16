/* eslint-disable no-tabs */
const shaderScan = `
#define SMOOTH(r,R) (1.0-smoothstep(R-1.0,R+1.0, r))
#define M_PI 3.1415926535897932384626433832795
#define blue3 vec3(0.35,0.76,0.83)
float movingLine(vec2 uv, vec2 center, float radius, float iTime)
{
    //angle of the line
    float theta0 = 90.0 * iTime;
    vec2 d = uv - center;
    float r = sqrt(dot(d,d));
    if(r<radius)
    {        
        d *= 1500.0;      
        radius *= 1500.0;
        //compute the distance to the line theta=theta0
        vec2 p = radius * vec2(cos(theta0*M_PI/180.0),-sin(theta0*M_PI/180.0));
        float l = length( d - p*clamp( dot(d,p)/dot(p,p), 0.0, 1.0) );
        d = normalize(d);
        //compute gradient based on angle difference to theta0
        float theta = mod(180.0*atan(d.y,d.x)/M_PI+theta0,360.0);
        float gradient = clamp(1.0-theta/90.0,0.0,1.0);
        return SMOOTH(l,1.0)+0.6*gradient;
    }
    else return 0.0;
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / 120.0;
    vec2 uv = materialInput.st;
    vec3 finalColor;
    vec2 c = vec2(0.5);
    float line = movingLine(uv, c, 0.5,iTime);
    finalColor += line * blue3;
    vec4 color = vec4(finalColor,1.0);
    color = mix(vec4(blue3,0.0),color,line);
    material.diffuse = color.rgb;
    material.alpha = color.a;
    return material;
} 
`;

const shaderDigitalBrain = `
// by srtuss, 2013
// rotate position around axis
vec2 rotate(vec2 p, float a)
{
    return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));
}

// 1D random numbers
float rand(float n)
{
    return fract(sin(n) * 43758.5453123);
}

// 2D random numbers
vec2 rand2(in vec2 p)
{
    return fract(vec2(sin(p.x * 591.32 + p.y * 154.077), cos(p.x * 391.32 + p.y * 49.077)));
}

// 1D noise
float noise1(float p)
{
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

// voronoi distance noise, based on iq's articles
float voronoi(in vec2 x)
{
    vec2 p = floor(x);
    vec2 f = fract(x);
        
    vec2 res = vec2(8.0);
    for(int j = -1; j <= 1; j ++)
    {
        for(int i = -1; i <= 1; i ++)
        {
            vec2 b = vec2(i, j);
            vec2 r = vec2(b) - f + rand2(p + b);
            
            // chebyshev distance, one of many ways to do this
            float d = max(abs(r.x), abs(r.y));
            
            if(d < res.x)
            {
                res.y = res.x;
                res.x = d;
            }
            else if(d < res.y)
            {
                res.y = d;
            }
        }
    }
    return res.y - res.x;
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / 120.0;
    float flicker = noise1(iTime * 2.0) * 0.8 + 0.4;
    vec2 uv = materialInput.st;
    uv = (uv - 0.5) * 2.0;
    float tmp = uv.x;
    uv.x = uv.y;
    uv.y = tmp;

    vec2 suv = uv;
    float v = 0.0;
    // uv *= 0.6 + sin(iTime * 0.1) * 0.4;
    // uv = rotate(uv, sin(iTime * 0.3) * 1.0);
    // uv += iTime * 0.4;
    float a = 0.6, f = 1.0;
        
    for(int i = 0; i < 3; i ++) // 4 octaves also look nice, its getting a bit slow though
    {
        float v1 = voronoi(uv * f + 5.0);
        float v2 = 0.0;
        
        // make the moving electrons-effect for higher octaves
        if(i > 0)
        {
            // of course everything based on voronoi
            v2 = voronoi(uv * f * 0.5 + 50.0 + iTime);
            
            float va = 0.0, vb = 0.0;
            va = 1.0 - smoothstep(0.0, 0.1, v1);
            vb = 1.0 - smoothstep(0.0, 0.08, v2);
            v += a * pow(va * (0.5 + vb), 2.0);
        }
        
        // make sharp edges
        v1 = 1.0 - smoothstep(0.0, 0.3, v1);
        
        // noise is used as intensity map
        v2 = a * (noise1(v1 * 5.5 + 0.1));
        
        // octave 0's intensity changes a bit
        if(i == 0)
            v += v2 * flicker;
        else
            v += v2;
        
        f *= 3.0;
        a *= 0.7;
    }

    // slight vignetting
    v *= exp(-0.6 * length(suv)) * 1.2;
        
    // use texture channel0 for color? why not.
    // vec3 cexp = texture(iChannel0, uv * 0.001).xyz * 3.0 + texture(iChannel0, uv * 0.01).xyz;//vec3(1.0, 2.0, 4.0);
    // cexp *= 1.4;
        
    // old blueish color set
    vec3 cexp = vec3(6.0, 4.0, 2.0);
        
    vec3 col = vec3(pow(v, cexp.x), pow(v, cexp.y), pow(v, cexp.z)) * 2.0;
    material.diffuse = col;
    material.alpha = v;

    return material;
} 
`;

const shaderHexagonal = `
#define FACTOR 20.
float iTime;
float HexDist(vec2 p, vec2 id){
    float t = iTime;
    mat2 rot = mat2(cos(t-id.x/FACTOR), -sin(t), sin(t), cos(t-id.x/FACTOR));
    p*=rot*1.3;
    p = abs(p); // Copy over first quad into all
    float c = dot(p, normalize(vec2(1,1.73)));// Dot to get correct angle
    return max(c, p.x); // Find where the vert line and angled intersect
}

vec4 HexCoords(vec2 uv){
    vec2 rep = vec2(1, 1.73);
    vec2 h = rep*0.5;
    vec2 a = mod(uv, rep)-h;
    vec2 b = mod(uv-h, rep)-h;

    
    vec2 gv;
	if(length(a) < length(b))
    	gv = a;
    else 
        gv = b;
    
    vec2 id = (uv-gv)+FACTOR;
    float y = 0.5-HexDist(gv, id);
    return vec4(gv.x, y, id.x, id.y);
}

czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    iTime = czm_frameNumber / 120.0;

    vec2 uv = materialInput.st;
    uv.x = (uv.x - 0.5) * 2.0;
    uv.y = (uv.y - 0.5) * 2.0;
	vec3 col = vec3(0);
    uv *= FACTOR;
	vec4 hexC = HexCoords(uv);
	float t = mod(iTime, 2000.);
    col += smoothstep(0.05, 0.1, hexC.y*sin(hexC.w*hexC.z+t));
    col += smoothstep(0.2, 0.15, hexC.y);
    col += 0.5-smoothstep(0.15, 0.1, hexC.y);
    col *= (0.7+sin(((hexC.z)/3.)+iTime)*0.3)*vec3(0.4, 0.7, 1.0);
    col += vec3(0.3, 0.4, 0.8)*0.2;
        
    material.diffuse = col;
    material.alpha = 0.5;

    return material;
} 
`;

const shaderFlash = `float rand(float x)
{
    return fract(sin(x)*75154.32912);
}

float noise(float x)
{
    float i = floor(x);
    float a = rand(i), b = rand(i+1.);
    float f = x - i;
    return mix(a,b,f);
}

float perlin(float x)
{
    float r=0.,s=1.,w=1.;
    for (int i=0; i<6; i++) {
        s *= 2.0;
        w *= 0.5;
        r += w * noise(s*x);
    }
    return r;
}


float f(float y)
{
    float w = 0.4; // width of strike
    return w * (perlin(2. * y) - 0.5);
}

float plot(vec2 p, float d, bool thicker)
{
    if (thicker) d += 5. * abs(f(p.y + 0.001) - f(p.y));
    return smoothstep(d, 0., abs(f(p.y) - p.x));
}

vec3 render(vec2 uv)
{
    float iTime = czm_frameNumber / 200.0;
    float x = iTime + 0.1;

    float m = 0.25; // max duration of strike
    float i = floor(x/m);
    float f = x/m - i;
    float k = 0.4; // frequency of strikes
    float n = noise(i);
    float t = ceil(n-k); // occurrence
    float d = max(0., n-k) / (1.-k); // duration
    float o = ceil(t - f - (1. - d)); // occurrence with duration
    float gt = 0.1; // glare duration
    float go = ceil(t - f - (1. - gt)); // glare occurrence
    
    float lightning = 0.;
    float light = 0.;
    float glare = 0.;
    
    if (o == 1.) {
        vec2 uv2 = uv;
        uv2.y += i * 2.; // select type of lightning
        float p = (noise(i+10.) - 0.5) * 2.; // position of lightning
        uv2.x -= p;
        
        float strike = plot(uv2, 0.01, true);
        float glow = plot(uv2, 0.04, false);
        float glow2 = plot(uv2, 1.5, false);

        lightning = strike * 0.4 + glow * 0.15;

        float h = noise(i+5.); // height
        lightning *= smoothstep(h, h+0.05, uv.y + perlin(1.2*uv.x + 4.*h)*0.03);
        lightning += glow2 * 0.3;
        light = smoothstep(5., 0., abs(uv.x - p));
        glare = go * light;
    }
    

    return vec3(lightning + glare);
}

czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 uv = materialInput.st;
    uv.x = 2. * uv.x - 1.;
    vec3 color = render(uv);
    material.diffuse = color;
    //float a = min(min(color.r,color.g),color.b);
    //material.alpha = pow(a,2.0);
    return material;
}`;

const shaderGlare = `//Shader License: CC BY 3.0
//Author: Jan Mróz (jaszunio15)

//Layered voronoi
#define VORONOI_NOISE_POW 5.0
#define VORONOI_BRIGHTNESS_ADD 0.05
#define SIZE_MUL 1.5
#define ALPHA_MUL 0.9
#define LAYERS 4

//Colors
#define WATER_COLOR vec4(0.0, 0.8, 0.8, 1.0)

//Image size and displacement
#define UV_MUL 3.0
#define UV_DISPLACEMENT_STRENGTH 0.15
#define UV_DISPLACEMENT_SIZE 5.0

//Animation
#define WATER_SPEED 0.5
#define ANIMATION_SPEED 2.0

float iTime;

float hash1_2(vec2 x)
{
 	return fract(sin(dot(x, vec2(52.127, 61.2871))) * 521.582);   
}

vec2 hash2_2(vec2 x)
{
    return fract(sin(x * mat2x2(20.52, 24.1994, 70.291, 80.171)) * 492.194);
}	

//Simple interpolated noise
vec2 noise2_2(vec2 uv)
{
    vec2 f = smoothstep(0.0, 1.0, fract(uv));
    
 	vec2 uv00 = floor(uv);
    vec2 uv01 = uv00 + vec2(0,1);
    vec2 uv10 = uv00 + vec2(1,0);
    vec2 uv11 = uv00 + 1.0;
    vec2 v00 = hash2_2(uv00);
    vec2 v01 = hash2_2(uv01);
    vec2 v10 = hash2_2(uv10);
    vec2 v11 = hash2_2(uv11);
    
    vec2 v0 = mix(v00, v01, f.y);
    vec2 v1 = mix(v10, v11, f.y);
    vec2 v = mix(v0, v1, f.x);
    
    return v;
}

vec2 rotate(vec2 point, float deg)
{
 	float s = sin(deg);
    float c = cos(deg);
    return mat2x2(s, c, -c, s) * point;
}

//Cell center from point on the grid
vec2 voronoiPointFromRoot(vec2 root, float deg)
{
  	vec2 point = hash2_2(root) - 0.5;
    float s = sin(deg);
    float c = cos(deg);
    point = mat2x2(s, c, -c, s) * point;
    point += root + 0.5;
    return point;
}

float degFromRootUV(vec2 uv)
{
 	return iTime * ANIMATION_SPEED * (hash1_2(uv) + 0.2);   
}

//x - voronoi coordinates (grid step = 1)
float voronoi(vec2 uv)
{
    vec2 rootUV = floor(uv);
    float deg = degFromRootUV(rootUV);
    vec2 pointUV = voronoiPointFromRoot(rootUV, deg);
    
    vec2 tempRootUV;	//Used in loop only
    vec2 tempPointUV;	//Used in loop only
    vec2 closestPointUV = pointUV;
    float minDist = 2.0;
    float dist = 2.0;
    for (float x = -1.0; x <= 1.0; x+=1.0)
    {
     	for (float y = -1.0; y <= 1.0; y+=1.0)   
        {
         	tempRootUV = rootUV + vec2(x, y);
            deg = (iTime * hash1_2(tempRootUV) * ANIMATION_SPEED);
            tempPointUV = voronoiPointFromRoot(tempRootUV, deg);
            
            dist = distance(uv, tempPointUV);
            if(dist < minDist)
            {
             	closestPointUV = tempPointUV;
               	minDist = dist;
            }
        }
    }
    
    return minDist;
}

//Layered voronoi noise
float fractVoronoi(vec2 uv, float sizeMul, float alphaMul, int layers)
{
 	float noise = 0.0;
    float size = 1.0;
    float alpha = 1.0;
    vec2 uvOffset; //Used in loop only
    for(int i = 0; i < layers; i++)
    {
        uvOffset = hash2_2(vec2(size, alpha)) * iTime * WATER_SPEED;
        noise += pow(voronoi((uv + uvOffset) * size) * alpha + VORONOI_BRIGHTNESS_ADD, VORONOI_NOISE_POW);
        size *= sizeMul;
        alpha *= alphaMul;
    }
    
    noise *= (1.0 - alphaMul)/(1.0 - pow(alphaMul, float(layers)));
    return noise;
}

czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    iTime = czm_frameNumber / 200.0;
    vec2 uv = materialInput.st;
    uv *= UV_MUL;
    vec2 noise2D = noise2_2(uv * UV_DISPLACEMENT_SIZE) * UV_DISPLACEMENT_STRENGTH;
    float fractVoro = fractVoronoi(uv + noise2D, SIZE_MUL, ALPHA_MUL, LAYERS);
    float res = smoothstep(-0.2, 0.3, fractVoro);
    vec4 color = vec4(res) * WATER_COLOR + fractVoro;
    material.diffuse = color.rgb;
    material.alpha = 0.5;
    return material;
}`;

const shaderRippleRadar = `
#define green vec3(1.0,1.0,0.0)
// returns a vec3 color from every pixel requested.
// Generates a BnW Ping on normalized 2d coordinate system
vec3 RadarPing(in vec2 uv, in vec2 center, in float innerTail, 
               in float frontierBorder, in float timeResetSeconds, 
               in float radarPingSpeed, in float fadeDistance, float t)
{
    vec2 diff = center-uv;
    float r = length(diff);
    float time = mod(t, timeResetSeconds) * radarPingSpeed;
   
    float circle;
    // r is the distance to the center.
    // circle = BipCenter---//---innerTail---time---frontierBorder
    //illustration
    //https://sketch.io/render/sk-14b54f90080084bad1602f81cadd4d07.jpeg
    circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder,time, r);
	circle *= smoothstep(fadeDistance, 0.0, r); // fade to 0 after fadeDistance
    return vec3(circle);
}

czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / 120.0;
    vec2 uv = materialInput.st - vec2(0.5);
    uv *= 2.0;
    vec3 color;
    // generate some radar pings
    float fadeDistance = 0.8;
    float resetTimeSec = 3.0;
    float radarPingSpeed = 0.2;
    vec2 greenPing = vec2(0.0, 0.0);
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, iTime) * green;
    color += RadarPing(uv, vec2(0.0, 0.0), 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, iTime + 1.) * green;
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, iTime + 2.) * green;
    material.diffuse = color.rgb;
    material.alpha = pow(color.g,2.0);
    return material;
}`;

const shaderMovingTexture = `czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 5.0);
    vec2 st = materialInput.st;
    st = (st - 0.5);
    st.y *= 2.0;

    st.x = fract(st.x - iTime);
    //st.x -= fract(iTime);
    // float lineCount = 1.0;
    // float scaledWidth = fract(lineCount * st.x);
    // scaledWidth = abs(scaledWidth - floor(scaledWidth));
    // st.x = scaledWidth;

    vec4 color = texture2D(image, vec2(st.y,st.x));
    material.diffuse = color.rgb;
    material.alpha = color.a;
    return material;
}`;


const shaderMagicCircle = `
#define PI 3.14159265359
float iTime = 0.0;
vec2 rotate(vec2 p, float rad) {
    mat2 m = mat2(cos(rad), sin(rad), -sin(rad), cos(rad));
    return m * p;
}

vec2 translate(vec2 p, vec2 diff) {
    return p - diff;
}

vec2 scale(vec2 p, float r) {
    return p*r;
}

float circle(float pre, vec2 p, float r1, float r2, float power) {
    float leng = length(p);
    float d = min(abs(leng-r1), abs(leng-r2));
    if (r1<leng && leng<r2) pre /= exp(d)/r2;
    float res = power / d;
    return clamp(pre + res, 0.0, 1.0);
}

float rectangle(float pre, vec2 p, vec2 half1, vec2 half2, float power) {
    p = abs(p);
    if ((half1.x<p.x || half1.y<p.y) && (p.x<half2.x && p.y<half2.y)) {
        pre = max(0.01, pre);
    }
    float dx1 = (p.y < half1.y) ? abs(half1.x-p.x) : length(p-half1);
    float dx2 = (p.y < half2.y) ? abs(half2.x-p.x) : length(p-half2);
    float dy1 = (p.x < half1.x) ? abs(half1.y-p.y) : length(p-half1);
    float dy2 = (p.x < half2.x) ? abs(half2.y-p.y) : length(p-half2);
    float d = min(min(dx1, dx2), min(dy1, dy2));
    float res = power / d;
    return clamp(pre + res, 0.0, 1.0);
}

float radiation(float pre, vec2 p, float r1, float r2, int num, float power) {
    float angle = 2.0*PI/float(num);
    float d = 1e10;
    for(int i=0; i<360; i++) {
        if (i>=num) break;
        float _d = (r1<p.y && p.y<r2) ? 
            abs(p.x) : 
        	min(length(p-vec2(0.0, r1)), length(p-vec2(0.0, r2)));
        d = min(d, _d);
        p = rotate(p, angle);
    }
    float res = power / d;
    return clamp(pre + res, 0.0, 1.0);
}

vec3 calc(vec2 p) {
    float dst = 0.0;
    p = scale(p, sin(PI*iTime/1.0)*0.02+1.1);
    {
        vec2 q = p;
        q = rotate(q, iTime * PI / 6.0);
        dst = circle(dst, q, 0.85, 0.9, 0.006);
        dst = radiation(dst, q, 0.87, 0.88, 36, 0.0008);
    }
    {
        vec2 q = p;
        q = rotate(q, iTime * PI / 6.0);
        const int n = 6;
        float angle = PI / float(n);
        q = rotate(q, floor(atan(q.x, q.y)/angle + 0.5) * angle);
        for(int i=0; i<n; i++) {
            dst = rectangle(dst, q, vec2(0.85/sqrt(2.0)), vec2(0.85/sqrt(2.0)), 0.0015);
            q = rotate(q, angle);
        }
    }
    {
        vec2 q = p;
        q = rotate(q, iTime * PI / 6.0);
        const int n = 12;
        q = rotate(q, 2.0*PI/float(n)/2.0);
        float angle = 2.0*PI / float(n);
        for(int i=0; i<n; i++) {
            dst = circle(dst, q-vec2(0.0, 0.875), 0.001, 0.05, 0.004);
            dst = circle(dst, q-vec2(0.0, 0.875), 0.001, 0.001, 0.008);
            q = rotate(q, angle);
        }
    }
    {
        vec2 q = p;
        dst = circle(dst, q, 0.5, 0.55, 0.002);
    }
    {
        vec2 q = p;
        q = rotate(q, -iTime * PI / 6.0);
        const int n = 3;
        float angle = PI / float(n);
        q = rotate(q, floor(atan(q.x, q.y)/angle + 0.5) * angle);
        for(int i=0; i<n; i++) {
            dst = rectangle(dst, q, vec2(0.36, 0.36), vec2(0.36, 0.36), 0.0015);
            q = rotate(q, angle);
        }
    }
    {
        vec2 q = p;
        q = rotate(q, -iTime * PI / 6.0);
        const int n = 12;
        q = rotate(q, 2.0*PI/float(n)/2.0);
        float angle = 2.0*PI / float(n);
        for(int i=0; i<n; i++) {
            dst = circle(dst, q-vec2(0.0, 0.53), 0.001, 0.035, 0.004);
            dst = circle(dst, q-vec2(0.0, 0.53), 0.001, 0.001, 0.001);
            q = rotate(q, angle);
        }
    }
    {
        vec2 q = p;
        q = rotate(q, iTime * PI / 6.0);
        dst = radiation(dst, q, 0.25, 0.3, 12, 0.005);
    }
    {
        vec2 q = p;
    	q = scale(q, sin(PI*iTime/1.0)*0.04+1.1);
        q = rotate(q, -iTime * PI / 6.0);
        for(float i=0.0; i<6.0; i++) {
            float r = 0.13-i*0.01;
            q = translate(q, vec2(0.1, 0.0));
        	dst = circle(dst, q, r, r, 0.002);
        	q = translate(q, -vec2(0.1, 0.0));
        	q = rotate(q, -iTime * PI / 12.0);
        }
        dst = circle(dst, q, 0.04, 0.04, 0.004);
    }
    return pow(dst, 2.5) * vec3(1.0, 0.95, 0.8);
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 uv = materialInput.st - vec2(0.5);
    uv *= 2.0;
    vec3 color = calc(uv);
    material.diffuse = color;
    material.alpha = min(color.r,color.g);
    return material;
}
`;

const shaderWatery = `
//#define CENTERED
float iTime = 0.0;
#define time iTime*0.2
mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
//float noise( in vec2 x ){return texture(iChannel0, x*.01).x;}
mat2 m2 = mat2( 0.80,  0.60, -0.60,  0.80 );
float fbm( in vec2 p )
{	
	float z=2.;
	float rz = 0.;
	for (float i= 1.;i < 7.;i++ )
	{
		//rz+= abs((noise(p)-0.5)*2.)/z;
		rz+= abs(0.5*2.)/z;
		z = z*2.;
		p = p*2.;
		p*= m2;
	}
	return rz;
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 p = materialInput.st - vec2(0.5);
    p *= 2.0;
    
    //p.x *= p.x/p.y;
    vec2 bp = p;
	#ifndef CENTERED
	p += 5.;
	p *= 0.6;
	#endif
	float rb = fbm(p*.5+time*.17)*.1;
	rb = sqrt(rb);
	#ifndef CENTERED
	p *= makem2(rb*.2+atan(p.y,p.x)*1.);
	#else
	p *= makem2(rb*.2+atan(p.y,p.x)*2.);
	#endif
	
	//coloring
	float rz = fbm(p*.9-time*.7);
	rz *= dot(bp*5.,bp)+.5;
	rz *= sin(p.x*.5+time*4.)*1.5;
	vec3 col = vec3(.04,0.07,0.45)/(.1-rz);
    material.diffuse = col.rgb;
    material.alpha = min(col.r,col.g);
    return material;
}
`;

const shaderGlowingRing = `czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 pos = materialInput.st;
    float iTime = czm_frameNumber / (600.0 * 1.0) * 3.14159265 * 2.0;
    float circDist = abs(sin(iTime)/2.0);
    float distFromCenter = distance(pos, vec2(0.5, 0.5));
    float distFromCirc = pow(0.001, distance(distFromCenter, circDist)*2.0);
    if(distFromCirc < 0.0) distFromCirc = 0.0;
    float color = 1.0 * distFromCirc;
    float a = color * (1.0 - distFromCenter);
    material.diffuse = vec3(color,0.0,0.0);
    material.alpha = pow(a,2.0);
    return material;
}`;

const shaderGlowingHexagonal = `
float iTime;
float hex( vec2 p, vec2 h )
{
	vec2 q = abs(p);
	return max(q.x - h.y,max(q.x + q.y * 0.57735, q.y * 1.1547) - h.x);
}

float gra( float v, float r )
{
    return clamp((0.5 * r - abs(0.5 - mod(v + 0.5, 1.0))) * 2.0 / r, 0.0, 1.0);
}

vec4 hexGrid( in vec2 uv )
{
	float radius = 0.1;
	float padding = 0.01;
	float grid_radius = radius + padding * 2.0 + 0.0733;
	vec2 grid = vec2(grid_radius * 1.73, grid_radius);

	vec2 p1 = mod(uv, grid) - grid * 0.5;
	vec2 p2 = mod(uv + grid * 0.5, grid) - grid * 0.5;
	float d1 = hex(p1, vec2(radius));
	float d2 = hex(p2, vec2(radius));
	float d = min(d1, d2);
	vec4 main_color = vec4(1.0, 0.0, 0.0, 0.0);
	vec4 hex_color = main_color * 0.5;
	vec4 grid_color = main_color * gra(uv.y + iTime, 0.75);
	vec4 grid_light_color = vec4(1.0, 1.0, 1.0, 0.0);
		
	grid_light_color = grid_light_color * gra(uv.y + iTime, 0.25);
    grid_light_color *= grid_light_color;
    grid_color += grid_light_color;
     
    grid_color.a = 0.25;
	hex_color.a = 0.25;
	
    vec4 c = (d < 0.0 ? 1.0 : 0.5) * hex_color;
    c += grid_color * (d < 0.0 ? 0.0 : 1.0);
    c += grid_light_color * max(0.0, d * 4.0 + 0.1) * 5.0;
    c += grid_light_color * max(0.0, d * 4.0 + 0.5) * 1.0;
    return c;
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 st = materialInput.st;
    st.x *= 2.0;
    st *= 2.0;
    vec4 color = hexGrid(st);
    material.diffuse = color.rgb;
    material.alpha = 1.0 - color.r;
    return material;
}`;

const shaderInnerOutline = `
float iTime;
float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898,12.1414))) * 83758.5453);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = mix(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);   
}

vec3 ramp(float t) {
	return t <= .5 ? vec3( 1. - t * 1.4, .2, 1.05 ) / t : vec3( .3 * (1. - t) * 2., .2, 1.05 ) / t;
}

float fire(vec2 n) {
    return noise(n) + noise(n * 2.1) * .6 + noise(n * 5.4) * .42;
}
vec3 getLine(vec3 col, vec2 fc, mat2 mtx, float shift){
    vec2 iResolution = vec2(1.0);
    float t = iTime;
    vec2 uv = (fc / iResolution.xy) * mtx;
    
    uv.x += uv.y < .5 ? 23.0 + t * .35 : -11.0 + t * .3;    
    uv.y = abs(uv.y - shift);
    uv *= 5.0;
    
    float q = fire(uv - t * .013) / 2.0;
    vec2 r = vec2(fire(uv + q / 2.0 + t - uv.x - uv.y), fire(uv + q - t));
    vec3 color = vec3(1.0 / (pow(vec3(0.5, 0.0, .1) + 1.61, vec3(4.0))));
    
    float grad = pow((r.y + r.y) * max(.0, uv.y) + .1, 4.0);
    color = ramp(grad);
    color /= (1.50 + max(vec3(0), color));
    
    if(color.b < .00000005)
        color = vec3(.0);
    
    return mix(col, color, color.b);
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 st = materialInput.st;
    vec3 color = vec3(0.);
    vec2 fragCoord = st;
    color = getLine(color, fragCoord, mat2(1., 1., 0., 1.), 1.02);
    color = getLine(color, fragCoord, mat2(1., 1., 1., 0.), 1.02);
    color = getLine(color, fragCoord, mat2(1., 1., 0., 1.), -0.02);
    color = getLine(color, fragCoord, mat2(1., 1., 1., 0.), -0.02);
    material.diffuse = color.rgb;
    float a =  min(color.r,color.g);
    material.alpha = pow(a,2.0);
    return material;
}`;

const shaderMovingGradient = `czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 st = materialInput.st;
    st.y = fract(st.y - iTime);
    vec3 color = 0.5 + 0.5*cos(iTime+st.xyx+vec3(0,2,4));
    material.diffuse = color.rgb;
    material.alpha = st.y;
    return material;
}`;

const shaderGlowTutorial = `czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 st = materialInput.st;
    vec2 pos = 0.5 - st;
    float dist = 1.0/length(pos);
    dist *= 0.1;
    dist = pow(dist, 0.8);
    vec3 col = dist * vec3(1.0, 0.5, 0.25);
    col = 1.0 - exp( -col );
    material.diffuse = col.rgb;
    material.alpha = dist * min(col.r,col.g);
    return material;
}`;

const shaderTopologica = `
float iTime;
float Hash3d(vec3 uv)
{
    float f = uv.x + uv.y * 37.0 + uv.z * 521.0;
    return fract(cos(f*3.333)*100003.9);
}
float mixP(float f0, float f1, float a)
{
    return mix(f0, f1, a*a*(3.0-2.0*a));
}
const vec2 zeroOne = vec2(0.0, 1.0);
float noise(vec3 uv)
{
    vec3 fr = fract(uv.xyz);
    vec3 fl = floor(uv.xyz);
    float h000 = Hash3d(fl);
    float h100 = Hash3d(fl + zeroOne.yxx);
    float h010 = Hash3d(fl + zeroOne.xyx);
    float h110 = Hash3d(fl + zeroOne.yyx);
    float h001 = Hash3d(fl + zeroOne.xxy);
    float h101 = Hash3d(fl + zeroOne.yxy);
    float h011 = Hash3d(fl + zeroOne.xyy);
    float h111 = Hash3d(fl + zeroOne.yyy);
    return mixP(
        mixP(mixP(h000, h100, fr.x), mixP(h010, h110, fr.x), fr.y),
        mixP(mixP(h001, h101, fr.x), mixP(h011, h111, fr.x), fr.y)
        , fr.z);
}

float PI=3.14159265;
#define saturate(a) clamp(a, 0.0, 1.0)
// Weird for loop trick so compiler doesn't unroll loop
// By making the zero a variable instead of a constant, the compiler can't unroll the loop and
// that speeds up compile times by a lot.
#define ZERO_TRICK max(0, -iFrame)

float Density(vec3 p)
{
    float final = noise(p*0.06125);
    float other = noise(p*0.06125 + 1234.567);
    other -= 0.5;
    final -= 0.5;
    final = 0.1/(abs(final*final*other));
    final += 0.5;
    return final*0.0001;
}

czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    iTime = czm_frameNumber / (60.0 * 5.0);
    vec2 uv = materialInput.st;

    // Camera up vector.
	vec3 camUp=vec3(0,1,0); // vuv

	// Camera lookat.
	vec3 camLookat=vec3(0,0.0,0);	// vrp
    vec2 iResolution = vec2(1.0);
	float mx= iTime * 0.01;
	float my= sin(iTime * 0.03)*0.2+0.2;//*PI/2.01;
	vec3 camPos=vec3(cos(my)*cos(mx),sin(my),cos(my)*sin(mx))*(200.2); 	// prp

	// Camera setup.
	vec3 camVec=normalize(camLookat - camPos);//vpn
	vec3 sideNorm=normalize(cross(camUp, camVec));	// u
	vec3 upNorm=cross(camVec, sideNorm);//v
	vec3 worldFacing=(camPos + camVec);//vcv
	vec3 worldPix = worldFacing + uv.x * sideNorm * (iResolution.x/iResolution.y) + uv.y * upNorm;//scrCoord
	vec3 relVec = normalize(worldPix - camPos);//scp

	// --------------------------------------------------------------------------------
	float t = 0.0;
	float inc = 0.02;
	float maxDepth = 70.0;
	vec3 pos = vec3(0,0,0);
    float density = 0.0;
	// ray marching time
    for (int i = 0; i < 37; i++)	// This is the count of how many times the ray actually marches.
    {
        if ((t > maxDepth)) break;
        pos = camPos + relVec * t;
        float temp = Density(pos);

        inc = 1.9 + temp*0.05;	// add temp because this makes it look extra crazy!
        density += temp * inc;
        t += inc;
    }

	// --------------------------------------------------------------------------------
	// Now that we have done our ray marching, let's put some color on this.
	vec3 finalColor = vec3(0.01,0.1,1.0)* density*0.2;
    material.diffuse = finalColor.rgb;
    material.alpha = min(finalColor.b,min(finalColor.r,finalColor.g));
    return material;
}`;

const shaderGlow = `float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898,12.1414))) * 83758.5453);
}

float noise(vec2 n) {
    const vec2 d = vec2(0.0, 1.0);
    vec2 b = floor(n);
    vec2 f = mix(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

vec3 ramp(float t) {
	return t <= .5 ? vec3( 1. - t * 1.4, .2, 1.05 ) / t : vec3( .3 * (1. - t) * 2., .2, 1.05 ) / t;
}

float fire(vec2 n) {
    return noise(n) + noise(n * 2.1) * .6 + noise(n * 5.4) * .42;
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 1.0);
    float t = iTime;
    vec2 uv = materialInput.st;
    uv.x += uv.y < .5 ? 23.0 + t * .35 : -11.0 + t * .3;    
    uv.y = abs(uv.y - .5);
    float q = fire(uv - t * .013) / 2.0;
    vec2 r = vec2(fire(uv + q / 2.0 + t - uv.x - uv.y), fire(uv + q - t));
    vec3 color = vec3(1.0 / (pow(vec3(0.5, 0.0, .1) + 1.61, vec3(4.0))));
    
    float grad = pow((r.y + r.y) * max(.0, uv.y) + .1, 4.0);
    color = ramp(grad);
    color /= (1.50 + max(vec3(0), color));
    material.diffuse = color.rgb;
    material.alpha = pow(color.r * color.g * color.b,5.0);
    return material;
}`;

const shaderLoadingCircle = `
float PI = 3.1415926;
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 1.0);
    float time = iTime;
    vec2 uv = materialInput.st - vec2(0.0,0.0);
    //uv *= 2.0;
    vec2 scrs = vec2(1.0,1.0);
    vec3 col = vec3(0.0);
    float x,y = 0.0;
	float radius = 0.052;
	const float dotsnb = 10.0;

	for(float i = 0.0 ; i < dotsnb ; i++){
		x = 0.2*cos(2.0*PI*i/dotsnb+time*(i+3.0)/3.0);
		y = 0.2*sin(2.0*PI*i/dotsnb+time*(i+3.0)/3.0);

		col += vec3(smoothstep(radius, radius-0.01, distance(uv, scrs/2.0 + vec2(x,y)) ) * (sin(i/dotsnb+time+2.0*PI/3.0)+1.0)/2.0,
					smoothstep(radius, radius-0.01, distance(uv, scrs/2.0 + vec2(x,y)) ) * (sin(i/dotsnb+time+4.0*PI/3.0)+1.0)/2.0,
					smoothstep(radius, radius-0.01, distance(uv, scrs/2.0 + vec2(x,y)) ) * (sin(i/dotsnb+time+6.0*PI/3.0)+1.0)/2.0);      
	}
    
    material.diffuse = col;
    material.alpha = pow(col.r * col.g * col.b,1.0);
    return material;
}`;

const shaderSpiralCircles = `
const float MATH_PI	= float( 3.14159265359 );
void Rotate( inout vec2 p, float a ) 
{
	p = cos( a ) * p + sin( a ) * vec2( p.y, -p.x );
}
float saturate( float x )
{
	return clamp( x, 0.0, 1.0 );
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 uv = materialInput.st - vec2(0.5,0.5);
    vec2 p = ( 2.0 * uv.xy - uv.xy )* 1000.0;

    float sdf = 1e6;
    float dirX = 0.0;
    for ( float iCircle = 1.0; iCircle < 16.0 * 4.0 - 1.0; ++iCircle )
    {
        float circleN = iCircle / ( 16.0 * 4.0 - 1.0 );
        float t = fract( circleN + iTime * 0.2 );
        
        float offset = -180.0 - 330.0 * t;
        float angle  = fract( iCircle / 16.0 + iTime * 0.01 + circleN / 8.0 );
        float radius = mix( 50.0, 0.0, 1.0 - saturate( 1.2 * ( 1.0 - abs( 2.0 * t - 1.0 ) ) ) );
        
        vec2 p2 = p;
        Rotate( p2, -angle * 2.0 * MATH_PI );
        p2 += vec2( -offset, 0.0 );
        
        float dist = length( p2 ) - radius;
        if ( dist < sdf )
        {
            dirX = p2.x / radius;
            sdf	 = dist;
        }
    }
    
    vec3 colorA = vec3( 24, 30, 28 );
    vec3 colorB = vec3( 249, 249, 249 );
    
    vec3 abberr = colorB;
	abberr = mix( abberr, vec3( 205, 80, 28 ), saturate( dirX ) );
    abberr = mix( abberr, vec3( 38, 119, 208 ), saturate( -dirX ) );
    
    colorB = mix( colorB, abberr, smoothstep( 0.0, 1.0, ( sdf + 5.0 ) * 0.1 ) );
    
    vec3 color = mix( colorA, colorB, vec3( 1.0 - smoothstep( 0.0, 1.0, sdf * 0.3 ) ) );
    color = color / 255.0;
    material.diffuse = color;
    material.alpha = pow(color.r * color.g * color.b,1.0);
    return material;
}`;

const shaderPulseCircle = `
vec3 hsb2rgb(in vec3 c)
{
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix( vec3(1.0), rgb, c.y);
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 uv = materialInput.st - vec2(0.5,0.5);
    uv *= 2.0;
    vec2 p = 2.0*uv;
    
    float r = length(p) * 0.9;
	vec3 color = hsb2rgb(vec3(0.24, 0.7, 0.4));
    
    float a = pow(r, 2.0);
    float b = sin(r * 0.8 - 1.6);
    float c = sin(r - 0.010);
    float s = sin(a - iTime * 3.0 + b) * c;
    color *= abs(1.0 / (s * 10.8)) - 0.01;
    material.diffuse = color;
    material.alpha = pow(color.b,1.0);
    return material;
}`;

const shaderThePulse = `
vec3 hsv(float h,float s,float v) {
	return mix(vec3(1.),clamp((abs(fract(h+vec3(3.,2.,1.)/3.)*6.-3.)-1.),0.,1.),s)*v;
}
float circle(vec2 p, float r) {
	return smoothstep(0.1, 0.0, abs(length(p)-r)); // try changing the 0.1 to 0.3
}
float r3 = sqrt(3.0);
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 st = materialInput.st - vec2(0.5,0.5);
    vec2 uv = 2.0*st;
	uv *= 40.0;
	float r = smoothstep(-0.7, 0.7, sin(iTime*1.57-length(uv)*0.1))+1.0;
	vec2 rep = vec2(4.0,r3*4.0);
	vec2 p1 = mod(uv, rep)-rep*0.5;
	vec2 p2 = mod(uv+vec2(2.0,0.0), rep)-rep*0.5;
	vec2 p3 = mod(uv+vec2(1.0,r3), rep)-rep*0.5;
	vec2 p4 = mod(uv+vec2(3.0,r3), rep)-rep*0.5;
	vec2 p5 = mod(uv+vec2(0.0,r3*2.0), rep)-rep*0.5;
	vec2 p6 = mod(uv+vec2(2.0,r3*2.0), rep)-rep*0.5;
	vec2 p7 = mod(uv+vec2(1.0,r3*3.0), rep)-rep*0.5;
	vec2 p8 = mod(uv+vec2(3.0,r3*3.0), rep)-rep*0.5;
	
	float c = 0.0;
	c += circle(p1, r);
	c += circle(p2, r);
	c += circle(p3, r);
	c += circle(p4, r);
	c += circle(p5, r);
	c += circle(p6, r);
	c += circle(p7, r);
	c += circle(p8 , r);
	vec3 color = hsv(r+0.7, 1.0, c);
    material.diffuse = color;
    material.alpha = max(color.b,max(color.g,color.r));
    return material;
}`;

const shaderTotalNoob = `
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 st = materialInput.st - vec2(0.5,0.5);
	vec2 p = 2.0*st;
    float tau = 3.1415926535*2.0;
    float a = atan(p.x,p.y);
    float r = length(p)*0.75;
    vec2 uv = vec2(a/tau,r);
	
	//get the color
	float xCol = (uv.x - (iTime / 3.0)) * 3.0;
	xCol = mod(xCol, 3.0);
	vec3 horColour = vec3(0.25, 0.25, 0.25);
	
	if (xCol < 1.0) {
		
		horColour.r += 1.0 - xCol;
		horColour.g += xCol;
	}
	else if (xCol < 2.0) {
		
		xCol -= 1.0;
		horColour.g += 1.0 - xCol;
		horColour.b += xCol;
	}
	else {
		
		xCol -= 2.0;
		horColour.b += 1.0 - xCol;
		horColour.r += xCol;
	}

	// draw color beam
	uv = (2.0 * uv) - 1.0;
	float beamWidth = (0.7+0.5*cos(uv.x*10.0*tau*0.15*clamp(floor(5.0 + 10.0*cos(iTime)), 0.0, 10.0))) * abs(1.0 / (30.0 * uv.y));
	vec3 horBeam = vec3(beamWidth);
	vec3 color = horBeam * horColour;
    material.diffuse = color;
    material.alpha = min(color.b,min(color.g,color.r));
    return material;
}`;

const shaderNoiseAnimationElectric = `
float iTime;
#define time iTime*0.15
#define tau 6.2831853
mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
//float noise( in vec2 x ){return texture(iChannel0, x*.01).x;}
float noise( in vec2 x ){return 0.0;}
float fbm(in vec2 p)
{	
	float z=2.;
	float rz = 0.;
	vec2 bp = p;
	for (float i= 1.;i < 6.;i++)
	{
		rz+= abs((noise(p)-0.5)*2.)/z;
		z = z*2.;
		p = p*2.;
	}
	return rz;
}
float dualfbm(in vec2 p)
{
    //get two rotated fbm calls and displace the domain
	vec2 p2 = p*.7;
	vec2 basis = vec2(fbm(p2-time*1.6),fbm(p2+time*1.7));
	basis = (basis-.5)*.2;
	p += basis;
	//coloring
	return fbm(p*makem2(time*0.2));
}
float circ(vec2 p) 
{
	float r = length(p);
	r = log(sqrt(r));
	return abs(mod(r*4.,tau)-3.14)*3.+.2;
}
czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    iTime = czm_frameNumber / (60.0 * 1.0);
    vec2 st = materialInput.st;
	vec2 p = st - 0.5;
	p*=4.;
	
    float rz = dualfbm(p);
	
	//rings
	p /= exp(mod(time*10.,3.14159));
	rz *= pow(abs((0.1-circ(p))),.9);
	
	//final color
	vec3 color = vec3(.2,0.1,0.4)/rz;
	color = pow(abs(color),vec3(.99));
    material.diffuse = color;
    material.alpha = color.b * color.g;
    return material;
}`;

const shaderElectric = `
    //uniform vec4 color;
	//uniform float speed;
    vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
	float speed = 10.0;
	#define pi 3.1415926535
	#define PI2RAD 0.01745329252
	#define TWO_PI (2. * PI)
	
	float rands(float p){
	return fract(sin(p) * 10000.0);
	}
	
	float noise(vec2 p){
	float time = fract( czm_frameNumber * speed / 1000.0);
	float t = time / 20000.0;
	if(t > 1.0) t -= floor(t);
	return rands(p.x * 14. + p.y * sin(t) * 0.5);
	}
	
	vec2 sw(vec2 p){
	return vec2(floor(p.x), floor(p.y));
	}
	
	vec2 se(vec2 p){
	return vec2(ceil(p.x), floor(p.y));
	}
	
	vec2 nw(vec2 p){
	return vec2(floor(p.x), ceil(p.y));
	}
	
	vec2 ne(vec2 p){
	return vec2(ceil(p.x), ceil(p.y));
	}
	
	float smoothNoise(vec2 p){
	vec2 inter = smoothstep(0.0, 1.0, fract(p));
	float s = mix(noise(sw(p)), noise(se(p)), inter.x);
	float n = mix(noise(nw(p)), noise(ne(p)), inter.x);
	return mix(s, n, inter.y);
	}
	
	float fbm(vec2 p){
	float z = 2.0;
	float rz = 0.0;
	vec2 bp = p;
	for(float i = 1.0; i < 6.0; i++){
	    rz += abs((smoothNoise(p) - 0.5)* 2.0) / z;
	    z *= 2.0;
	    p *= 2.0;
	}
	return rz;
	}
	
	czm_material czm_getMaterial(czm_materialInput materialInput)
	{
        czm_material material = czm_getDefaultMaterial(materialInput);
        vec2 st = materialInput.st;
        vec2 st2 = st;
        float time = fract( czm_frameNumber * speed / 1000.0);
        if (st.y < 0.5) {
            discard;
        }
        st *= 4.;
        float rz = fbm(st);
        st /= exp(mod( time * 2.0, pi));
        rz *= pow(15., 0.9);
        vec4 temp = vec4(0);
        temp = mix( color / rz, vec4(color.rgb, 0.1), 0.2);
        if (st2.y < 0.05) {
            temp = mix(vec4(color.rgb, 0.1), temp, st2.y / 0.05);
        }
        if (st2.y > 0.95){
            temp = mix(temp, vec4(color.rgb, 0.1), (st2.y - 0.95) / 0.05);
        }
        material.diffuse = temp.rgb;
        material.alpha = temp.a * 2.0;
        return material;
	}
`;

export {
  shaderScan,
  shaderDigitalBrain,
  shaderHexagonal,
  shaderFlash,
  shaderWatery,
  shaderGlare,
  shaderRippleRadar,
  shaderMovingTexture,
  shaderMovingGradient,
  shaderTopologica,
  shaderGlow,
  shaderMagicCircle,
  shaderGlowingRing,
  shaderGlowingHexagonal,
  shaderInnerOutline,
  shaderGlowTutorial,
  shaderLoadingCircle,
  shaderSpiralCircles,
  shaderPulseCircle,
  shaderThePulse,
  shaderTotalNoob,
  shaderNoiseAnimationElectric,
  shaderElectric,
};
