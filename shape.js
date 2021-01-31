import { multMatrixVector, toVec, vecAdd, calcCentroid, rotatePoints } from './vectorUtils.js'

export function Shape(vertices = [], position = [0, 0], orientation = 0, color = 'rgb(255, 165, 0)') {
  this.vertices = vertices;
  this.centroid = [0, 0];
  this.centroidOrig = [0, 0];
  this.orientation = orientation;
  this.color = color;
  this.move = this.move.bind(this);
}


Shape.prototype.move = function (translate = [0, 0]) {
  this.centroid = this.centroid.map((coord, idx) => coord + translate[idx]);
  this.vertices = this.vertices.map(
    vtx => vtx.map((coord, idx) => coord + translate[idx])
  )
}

Shape.prototype.rotate = function (deg = 0, rotationPt = this.centroid) {
  this.vertices = rotatePoints(deg,this.vertices,rotationPt)
}

Shape.prototype.calcCentroid = function (vertices) {
  return vertices.reduce((acc, ele) => acc.map((e, idx) => e + ele[idx]))
    .map(ele => ele / (this.vertices.length));
}

