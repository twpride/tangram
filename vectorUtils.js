
export const toVec = (a, b) => [b[0] - a[0], b[1] - a[1]];
export const cross = (v, w) => v[0] * w[1] - v[1] * w[0];

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


export function findIntersection(p, r, q, s) {
  /*
    Based on: https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect

    q+s  p+r
      \/__________ q+u*s
      /\  
     /  \
    p    q
    
    u = (q − p) × r / (r × s)
    when r × s = 0, the lines are either colinear or parallel

    function returns u
    for intersection to exist, 0<u<1
  */
  const q_minus_p = toVec(p, q);
  const r_cross_s = cross(r, s);
  if (r_cross_s === 0) return null;
  return cross(q_minus_p, r) / r_cross_s;
}


export const dot = (v, w) => v[0] * w[0] + v[1] * w[1];
export function calcPenetration(sVertices, p, lastMouseMove) {
  /*
    determine if last mouse move caused a state change for point p
    from no penetration to penetration into shape s (represented by sVertices)

    if such state change occured, return the penetration quantity in vector form with the unit of pixels
    if not, this return null
  */
  let prev = sVertices[sVertices.length - 1];

  // scale last mouse move vector by 20%, empirically this has been found to help 
  // with interseciton detection sensitivity
  lastMouseMove = lastMouseMove.map(ele => ele * 1.2);

  // iterate through each polygon edge, return if penetration is encountered
  for (let k = 0; k < sVertices.length; k++) {
    const currVertex = sVertices[k];
    const edgeVec = toVec(currVertex, prev); // vector respresenting current polygon edge
    const res = findIntersection(currVertex, edgeVec, p, lastMouseMove)
    if (res
      && res > 0 // res==0, when p started on on the polygon edge
      && res < 1 // res==1, when p is on polygon edge after mouse move
    ) {
      // point indeed penetrated the current polygon edge
      // calculate and return perpendicular component between p and the polygon edge
      const p_currVertex_vec = toVec(p, currVertex); //
      const precalc = dot(p_currVertex_vec, edgeVec) / (edgeVec[0] ** 2 + edgeVec[1] ** 2);
      return p_currVertex_vec.map((ele, idx) => ele - precalc * edgeVec[idx]);
    }
    prev = currVertex;
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

export const vecAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];

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

