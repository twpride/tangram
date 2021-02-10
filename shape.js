import { rotatePoints, multMatrixVector, toVec, vecAdd } from './vectorUtils.js'


export const move = function (shape, translate = [0, 0]) {

  shape.centroid = shape.centroid.map((coord, idx) => coord + translate[idx]);
  shape.vertices = shape.vertices.map(
    vtx => vtx.map((coord, idx) => coord + translate[idx])
  )
}

export const rotate = function (shape, angle = 0) {
  shape.vertices = rotatePoints(angle, shape.vertices, shape.centroid)
  shape.orientation += angle;
}

export const snapTo45 = function (shape) {
  const deg = Math.round(shape.orientation / 45) * 45 - shape.orientation
  shape.vertices = rotatePoints(deg, shape.vertices, shape.centroid)
  shape.orientation += deg;
}


export const flipPoints = function (shape) {
  const rotMat = [
    -1, 0,
    0, 1
  ]

  shape.vertices = shape.vertices.map(
    vec => vecAdd(
      shape.centroid, multMatrixVector(rotMat, toVec(shape.centroid, vec))
    )
  ).reverse()

  shape.orientation = 180 - shape.orientation;
}


