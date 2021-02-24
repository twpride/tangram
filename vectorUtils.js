

export const vecAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];

export function insidePoly(vertices, p) {
  // important!! this assumes vertices are arranged in counter clockwise order
  let left = vertices[vertices.length - 1];
  for (let i = 0; i < vertices.length; i++) {
    const center = vertices[i];
    if (cross(toVec(center, left), toVec(center, p)) > 0) {
      return false;
    }
    left = center;
  }
  return true;
}




export const cross = (v, w) => v[0] * w[1] - v[1] * w[0];
export const dot = (v, w) => v[0] * w[0] + v[1] * w[1];
export const toVec = (a, b) => [b[0] - a[0], b[1] - a[1]];

export function findIntersection(p, r, q, s) {
  const q_minus_p = toVec(p, q);
  // const r_cross_s = cross(r, s.map(ele=>2*ele));
  const r_cross_s = cross(r, s);
  if (r_cross_s === 0) return null;
  return cross(q_minus_p, r) / r_cross_s;
}

export function calcPenetration(vertices, p, lastMouseMove) {
  // determine if the latest mouse move was a state change 
  // from no collision to collision
  let prev = vertices[vertices.length - 1];
  for (let k = 0; k < vertices.length; k++) {
    const curr = vertices[k];
    const edgeVec = toVec(curr, prev);
    const res = findIntersection(curr, edgeVec, p, lastMouseMove)
    if (res
      // && res >= 0 // res==0, when point(q) start out already on line (p,p+r)
      && res < 1 // res==1, when mouse pos after lastMouseMove is right on line (p,p+r)
    ) {
      const p_curr_vec = toVec(p, curr);
      const precalc = dot(p_curr_vec, edgeVec) / (edgeVec[0] ** 2 + edgeVec[1] ** 2);
      return p_curr_vec.map((ele, idx) => ele - precalc * edgeVec[idx]);
    }
    prev = curr;
  }
  return null;
}


export function multMatrixVector(matrix, vector) {
  if (!matrix.length % vector.length) {
    throw new Error('invalid matrix or vector dimensions')
  };
  const nr = matrix.length / vector.length;
  let res = []
  for (let i = 0; i < nr; i++) {
    res[i] = vector.reduce(
      (acc, ele, idx) => acc + ele * matrix[i * vector.length + idx]
      , 0
    )
  }
  return res;
}

export function rotatePoints(deg, vertices, rotationPt) {
  const radians = deg * Math.PI / 180;
  const rotMat = [
    Math.cos(radians), -Math.sin(radians),
    Math.sin(radians), Math.cos(radians)
  ]
  return vertices.map(
    vec => vecAdd(
      rotationPt, multMatrixVector(rotMat, toVec(rotationPt, vec))
    )
  )
}

