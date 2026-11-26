// GLSL for the FSudoLab signature blob, matched to the hero animation:
// a soft, matte, velvety violet shape with a few big rounded lobes.
// No gloss, no sharp ripples: low-frequency noise and soft wrap lighting.

const noise = /* glsl */ `
// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT licence)
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`


// ── Contact icons: question mark, email, send, check ──────────────────────────
// Each icon is a flat 2D shape pushed out into a thick tile. iconS = the outline (drives the
// silhouette), iconD = the raised symbol on the front face (drawn in the fragment shader).
const icons = /* glsl */ `
float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
float sdRBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float sdTri(vec2 p, vec2 p0, vec2 p1, vec2 p2){
  vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
  vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;
  vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
  vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
  vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
                   vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
                   vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}
// Question mark glyph (hook + stem + dot), stroke half-width w.
float sdQuestion(vec2 p, float w){
  vec2 c = vec2(0.0, 0.34); float R = 0.34;
  vec2 q = p - c; float ang = atan(q.y, q.x);
  float a0 = radians(-70.0), a1 = radians(170.0);
  float arc = (ang > a0 && ang < a1) ? abs(length(q) - R)
            : min(length(p - (c + R * vec2(cos(a0), sin(a0)))), length(p - (c + R * vec2(cos(a1), sin(a1)))));
  float stem = min(sdSeg(p, vec2(0.116, 0.02), vec2(0.0, -0.14)), sdSeg(p, vec2(0.0, -0.14), vec2(0.0, -0.3)));
  float dot_ = length(p - vec2(0.0, -0.62)) - (w + 0.02);
  return min(min(arc, stem) - w, dot_);
}
float sdCheck(vec2 p, float w){ return min(sdSeg(p, vec2(-0.62, 0.12), vec2(-0.12, -0.36)), sdSeg(p, vec2(-0.12, -0.36), vec2(0.78, 0.56))) - w; }
const vec2 PA = vec2(0.95, 0.62), PB = vec2(-0.95, 0.02), PC = vec2(0.05, -0.82), PF = vec2(-0.12, -0.12);

float iconS(vec2 p, int k){
  if (k == 0) return sdQuestion(p * 0.9, 0.15) / 0.9;
  if (k == 1) return sdRBox(p, vec2(0.95, 0.66), 0.14);
  if (k == 2) return sdTri(p, PA, PB, PC);
  return sdCheck(p, 0.2);
}
float iconD(vec2 p, int k){
  if (k == 0) return sdQuestion(p * 0.9, 0.11) / 0.9;
  if (k == 1) { // a raised panel with the envelope flap cut into it
    float panel = sdRBox(p, vec2(0.84, 0.55), 0.08);
    float flap = min(sdSeg(p, vec2(-0.84, 0.55), vec2(0.0, -0.06)), sdSeg(p, vec2(0.0, -0.06), vec2(0.84, 0.55))) - 0.045;
    return max(panel, -flap);
  }
  if (k == 2) { // the paper plane with its fold line
    float tri = sdTri(p, PA, PB, PC) + 0.07;
    float fold = sdSeg(p, PA, PF) - 0.035;
    return max(tri, -fold);
  }
  return sdCheck(p, 0.14);
}
// Far edge of the outline along direction d (2D), found by marching in from outside.
float farExit(vec2 d, int k){
  float t = 1.3;
  for (int i = 0; i < 30; i++) { if (iconS(d * t, k) < 0.0) break; t -= 0.044; }
  float lo = max(t, 0.0), hi = t + 0.044;
  for (int j = 0; j < 4; j++) { float m = 0.5 * (lo + hi); if (iconS(d * m, k) < 0.0) lo = m; else hi = m; }
  return max(lo, 0.06);
}
// Radius of the thick tile along a 3D direction: the outline in x/y, a flat face in z,
// with rounded edges where they meet.
float iconR(vec3 n, int k){
  float a = length(n.xy);
  float rxy = a > 0.001 ? farExit(n.xy / a, k) / a : 10.0;
  float rz = 0.3 / max(abs(n.z), 0.001);
  float kk = 0.1;
  float h = clamp(0.5 + 0.5 * (rz - rxy) / kk, 0.0, 1.0);
  return mix(rz, rxy, h) - kk * h * (1.0 - h);
}
`

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uDistort; // how far the lobes push out
uniform float uFreq;    // lobe count (lower = fewer, bigger lobes)
uniform vec3 uShape;    // morph weights: x = Discover sparkle, y = Design gem, z = Deliver box
uniform float uSpin;    // turns the gem so its facets catch the light
uniform float uBreak;   // teleport: 0 = here, 1 = beamed away
uniform float uFace;    // Deliver → work handoff: 0 = tumbling box, 1 = broad face square to the viewer
uniform vec4 uIcon;     // contact icons, morph weights: x = question mark, y = email, z = send, w = check
uniform float uIconMix; // 0 = blob, 1 = icon
varying float vFade;
varying float vFlash;
varying vec3 vNormal;
varying vec3 vObjNormal;
varying float vDisp;
varying vec3 vObjPos;
${noise}
${icons}

// ── The signature blob ────────────────────────────────────────────────────────
float blobR(vec3 p){
  // One slow, low-frequency layer: big rounded lobes like the hero blob.
  float n = snoise(p * uFreq + vec3(0.0, uTime * 0.35, uTime * 0.2));
  // Peaks swell into round bulbs (the hero's "arms"); valleys stay shallow.
  float bulb = smoothstep(0.0, 1.05, n);
  return 1.0 + (0.22 * n + 0.95 * bulb) * uDistort;
}

// ── Chapter 02 shapes (all measured as a radius along direction p) ─────────────
// Discover: a soft four-point sparkle facing the viewer, twinkling slowly.
float sparkleR(vec3 p){
  float th = atan(p.y, p.x) + uTime * 0.12;
  float eq = 1.0 - abs(p.z);
  float main = pow(abs(cos(2.0 * th)), 4.0);
  float minor = pow(abs(sin(2.0 * th)), 10.0) * 0.18;
  float r = 0.72 + (0.95 * main + minor) * eq * eq;
  return r * mix(1.0, 0.7, smoothstep(0.35, 1.0, abs(p.z)));
}

// Design: a cut gem (stretched octahedron) with softened edges, turning slowly.
float gemR(vec3 p){
  float c = cos(uSpin), s = sin(uSpin);
  vec3 q = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  float l1 = abs(q.x) + abs(q.y) * 0.72 + abs(q.z);
  return mix(1.25 / l1, 1.05, 0.12);
}

// Deliver: a soft rounded box — a package on its way — tipped toward you and turning.
float boxR(vec3 p){
  // uFace untwists the box until its broad face looks straight at the viewer.
  float spin = uSpin * 0.7 * (1.0 - uFace);
  float c = cos(spin), s = sin(spin);
  vec3 q = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  float tilt = 0.5 * (1.0 - uFace);
  float ct = cos(tilt), st = sin(tilt);
  q = vec3(q.x, ct * q.y - st * q.z, st * q.y + ct * q.z);
  vec3 a = abs(q);
  float n = mix(7.0, 18.0, uFace); // higher = sharper corners; facing the viewer it matches the window radius
  float l = pow(pow(a.x, n) + pow(a.y, n) + pow(a.z, n), 1.0 / n);
  return 0.9 / max(l, 0.001);
}

float radius(vec3 p){
  float b = blobR(p);
  float w = uShape.x + uShape.y + uShape.z;
  float r = b;
  if (w >= 0.001) {
    float shape = (uShape.x * sparkleR(p) + uShape.y * gemR(p) + uShape.z * boxR(p)) / w;
    // Shapes keep a faint breath of the blob so they still feel alive.
    shape *= 1.0 + 0.04 * (1.0 - uFace) * snoise(p * 1.3 + uTime * 0.4);
    r = mix(b, shape, clamp(w, 0.0, 1.0));
  }
  if (uIconMix > 0.001) {
    float wi = uIcon.x + uIcon.y + uIcon.z + uIcon.w;
    float ri = 0.0;
    if (uIcon.x > 0.001) ri += uIcon.x * iconR(p, 0);
    if (uIcon.y > 0.001) ri += uIcon.y * iconR(p, 1);
    if (uIcon.z > 0.001) ri += uIcon.z * iconR(p, 2);
    if (uIcon.w > 0.001) ri += uIcon.w * iconR(p, 3);
    ri = ri / max(wi, 0.001) * (1.0 + 0.025 * snoise(p * 1.6 + uTime * 0.5));
    r = mix(r, ri, uIconMix);
  }
  return r;
}

void main(){
  vec3 n = normalize(position);
  vec3 t = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 b = cross(n, t);
  float e = 0.012;
  float r0 = radius(n);
  vec3 p0 = n * r0;
  vec3 n1 = normalize(n + t * e);
  vec3 n2 = normalize(n + b * e);
  vec3 p1 = n1 * radius(n1);
  vec3 p2 = n2 * radius(n2);
  vec3 dn = normalize(cross(p1 - p0, p2 - p0));

  vDisp = (r0 - 1.0) / max(uDistort, 0.15);
  vObjNormal = dn;
  vObjPos = p0;
  vNormal = normalize(normalMatrix * dn);
  vFade = 1.0;

  // Teleport: the blob twists and squeezes into a thin, glowing beam of light, which then
  // collapses and vanishes; running uBreak backwards beams it back in.
  vec3 pos = p0;
  vFlash = 0.0;
  if (uBreak > 0.001) {
    float b = uBreak;
    float sq = smoothstep(0.0, 0.65, b);
    // Twist around the vertical axis, more the higher up the surface is.
    float ang = sq * 4.5 * p0.y;
    float c = cos(ang), s = sin(ang);
    pos.xz = vec2(c * pos.x - s * pos.z, s * pos.x + c * pos.z);
    // Squeeze into a tall, thin beam…
    pos.xz *= 1.0 - 0.8 * sq;
    pos.y *= 1.0 + 0.2 * sq;
    // …which finally collapses into a point of light.
    pos.y *= 1.0 - 0.9 * smoothstep(0.65, 1.0, b);
    vFlash = smoothstep(0.08, 0.6, b);
    vFade = 1.0 - smoothstep(0.5, 0.95, b);
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

// Crisp icon meshes (extruded shapes): no displacement, same varyings as the blob so they share
// the fragment shader (and its colours) exactly.
export const iconVertexShader = /* glsl */ `
varying float vFade;
varying float vFlash;
varying vec3 vNormal;
varying vec3 vObjNormal;
varying float vDisp;
varying vec3 vObjPos;
void main(){
  vObjPos = position;
  vObjNormal = normal;
  vNormal = normalize(normalMatrix * normal);
  vDisp = 0.0;
  vFade = 1.0;
  vFlash = 0.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragmentShader = /* glsl */ `
uniform float uOpacity;
uniform float uHue; // 0 = deep violet, 1 = lighter orchid
varying float vFade;
varying float vFlash;
varying vec3 vNormal;
varying vec3 vObjNormal;
varying float vDisp;
varying vec3 vObjPos;
uniform vec4 uIcon;
uniform float uIconMix;
uniform float uInk; // Deliver → work handoff: 0 = purple material, 1 = code-window navy with a violet edge
${icons}

void main(){
  // Measured from the hero animation frames (luminance percentiles of the blob's pixels),
  // so the moving blob is the same plum → violet → mauve as the hero blob.
  vec3 navy   = vec3(0.170, 0.108, 0.281); // #2b1b47  deepest shadow
  vec3 indigo = vec3(0.236, 0.139, 0.344); // #3c2357
  vec3 violet = vec3(0.345, 0.208, 0.490); // #58357d  body
  vec3 orchid = vec3(0.557, 0.338, 0.622); // #8d569e  lit lobes
  vec3 mauve  = vec3(0.710, 0.535, 0.721); // #b588b7  softest highlight

  vec3 N = normalize(vNormal);

  // Soft "wrap" light from the upper right, like the hero render. No specular.
  vec3 L = normalize(vec3(0.75, 0.6, 0.28));
  float wrap = clamp((dot(N, L) + 0.45) / 1.45, 0.0, 1.0);
  wrap = wrap * wrap * (3.0 - 2.0 * wrap);

  // Lobes that stick out catch a little more light.
  float lit = clamp(0.2 + wrap * 0.85 + vDisp * 0.1 + uHue * 0.1, 0.0, 1.0);
  vec3 col = mix(navy, indigo, smoothstep(0.0, 0.25, lit));
  col = mix(col, violet, smoothstep(0.2, 0.5, lit));
  col = mix(col, orchid, smoothstep(0.5, 0.88, lit));
  col = mix(col, mauve, smoothstep(0.86, 1.0, lit) * 0.55);

  // Velvet: edges facing away from the viewer get slightly darker, not brighter.
  float facing = clamp(N.z, 0.0, 1.0);
  col *= 0.92 + 0.08 * facing;

  // Deep navy pooling on the far-left / lower side of the shape (object space).
  float pool = smoothstep(0.1, 0.9, dot(normalize(vObjNormal), normalize(vec3(-0.8, -0.3, -0.2))));
  col = mix(col, navy, pool * 0.3);

  // Teleport glow: the beam glows violet (reads on both the light and the dark sections).
  col = mix(col, vec3(0.86, 0.55, 1.0), vFlash * 0.6);
  // Contact icons: the symbol is raised on the front face — lighter, with a soft lit rim — and
  // the rest of the face sits a shade deeper, so the icon reads at any size.
  if (uIconMix > 0.001) {
    vec2 q = vObjPos.xy;
    float wi = max(uIcon.x + uIcon.y + uIcon.z + uIcon.w, 0.001);
    float d = (uIcon.x * iconD(q, 0) + uIcon.y * iconD(q, 1) + uIcon.z * iconD(q, 2) + uIcon.w * iconD(q, 3)) / wi;
    float front = smoothstep(0.55, 0.9, normalize(vObjNormal).z);
    float raised = 1.0 - smoothstep(-0.012, 0.012, d);
    float edge = 1.0 - smoothstep(0.0, 0.035, abs(d));
    // Kept a deep violet (not pale) so the white headline in front stays easy to read.
    vec3 glyph = mix(violet, orchid, 0.35 + 0.5 * smoothstep(-0.3, 0.7, q.y));
    vec3 iconCol = mix(mix(indigo, violet, 0.35), glyph, raised);
    iconCol = mix(iconCol, mauve, edge * 0.45 * (0.4 + 0.6 * smoothstep(-0.5, 0.8, q.y)));
    col = mix(col, iconCol, front * uIconMix);
  }

  // Handoff: the face that looks at the viewer turns into the code window's navy glass, the rim
  // into its violet border, and one highlight stays on the upper edge so the eye can follow it.
  if (uInk > 0.001) {
    float rim = pow(1.0 - facing, 2.2);
    float topEdge = smoothstep(0.35, 0.9, N.y) * (1.0 - facing * 0.6);
    vec3 face = mix(vec3(0.067, 0.078, 0.184), vec3(0.098, 0.106, 0.239), facing); // #11142f → #191b3d
    vec3 inked = mix(face, vec3(0.757, 0.227, 0.820), rim * 0.9);                  // violet #c13ad1 edge
    inked = mix(inked, vec3(0.93, 0.76, 0.98), topEdge * 0.55);
    col = mix(col, inked, uInk);
  }
  if (vFade < 0.01) discard;
  gl_FragColor = vec4(col, uOpacity * vFade);
}
`
