// Crisp 3D icons for the contact section: question mark, email, send, check.
// Each is a flat outline extruded into a thick tile with rounded (bevelled) edges, in the same
// coordinates as iconS / iconD in shaders.ts, so the raised detail on the front face lines up.

import { ExtrudeGeometry, Shape, Vector2 } from 'three'

type P = [number, number]

/** Outline of a thick stroke along a polyline: round caps, mitred joins. */
function strokeShape(points: P[], w: number): Shape {
  const pts = points.map(([x, y]) => new Vector2(x, y))
  const n = pts.length
  const normals = pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)]!
    const b = pts[Math.min(n - 1, i + 1)]!
    const d = b.clone().sub(a).normalize()
    return new Vector2(-d.y, d.x)
  })
  const left: Vector2[] = []
  const right: Vector2[] = []
  for (let i = 0; i < n; i++) {
    let m = normals[i]!.clone()
    let len = w
    if (i > 0 && i < n - 1) {
      // Mitre: keep the stroke the same width through the corner.
      const prev = pts[i]!.clone().sub(pts[i - 1]!).normalize()
      const pn = new Vector2(-prev.y, prev.x)
      const cos = Math.max(0.35, m.dot(pn))
      len = w / cos
    }
    m = m.multiplyScalar(len)
    left.push(pts[i]!.clone().add(m))
    right.push(pts[i]!.clone().sub(m))
  }
  const cap = (c: Vector2, from: Vector2, out: Vector2[]) => {
    const a0 = Math.atan2(from.y - c.y, from.x - c.x)
    for (let k = 1; k < 12; k++) {
      const a = a0 - (Math.PI * k) / 12
      out.push(new Vector2(c.x + Math.cos(a) * w, c.y + Math.sin(a) * w))
    }
  }
  const outline: Vector2[] = [...left]
  cap(pts[n - 1]!, left[n - 1]!, outline)
  outline.push(...right.reverse())
  cap(pts[0]!, right[right.length - 1]!, outline)
  return new Shape(outline)
}

function roundedRect(hw: number, hh: number, r: number): Shape {
  const s = new Shape()
  s.moveTo(-hw + r, -hh)
  s.lineTo(hw - r, -hh)
  s.quadraticCurveTo(hw, -hh, hw, -hh + r)
  s.lineTo(hw, hh - r)
  s.quadraticCurveTo(hw, hh, hw - r, hh)
  s.lineTo(-hw + r, hh)
  s.quadraticCurveTo(-hw, hh, -hw, hh - r)
  s.lineTo(-hw, -hh + r)
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh)
  return s
}

function circle(cx: number, cy: number, r: number): Shape {
  const s = new Shape()
  s.absarc(cx, cy, r, 0, Math.PI * 2, false)
  return s
}

const BEVEL = 0.07 // bevel grows the outline by this much, so outlines are drawn this much smaller

function questionMark(): Shape[] {
  // Same geometry as sdQuestion (which is evaluated at p * 0.9, hence the 1/0.9 scale).
  const k = 1 / 0.9
  const c: P = [0, 0.34]
  const R = 0.34
  const pts: P[] = []
  for (let a = 170; a >= -70; a -= 6) {
    const r = (a * Math.PI) / 180
    pts.push([(c[0] + R * Math.cos(r)) * k, (c[1] + R * Math.sin(r)) * k])
  }
  pts.push([0.0 * k, -0.14 * k], [0.0 * k, -0.3 * k])
  return [strokeShape(pts, 0.15 * k - BEVEL), circle(0, -0.62 * k, 0.17 * k - BEVEL)]
}

function envelope(): Shape[] {
  return [roundedRect(0.95 - BEVEL, 0.66 - BEVEL, 0.12)]
}

function plane(): Shape[] {
  // Inset triangle PA, PB, PC (see shaders.ts).
  const A = new Vector2(0.95, 0.62), B = new Vector2(-0.95, 0.02), C = new Vector2(0.05, -0.82)
  const g = A.clone().add(B).add(C).divideScalar(3)
  const inset = (v: Vector2) => v.clone().sub(g).multiplyScalar(0.93).add(g)
  return [new Shape([inset(A), inset(B), inset(C)])]
}

function check(): Shape[] {
  return [strokeShape([[-0.62, 0.12], [-0.12, -0.36], [0.78, 0.56]], 0.2 - BEVEL)]
}

const DEPTH = 0.42

/** The four icon geometries, in the order the shader uses: question, email, send, check. */
export function buildIconGeometries(): ExtrudeGeometry[] {
  return [questionMark(), envelope(), plane(), check()].map((shapes) => {
    const g = new ExtrudeGeometry(shapes, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: BEVEL,
      bevelSegments: 6,
      curveSegments: 24,
    })
    g.translate(0, 0, -DEPTH / 2)
    return g
  })
}
