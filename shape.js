import { rotatePoints, snapTo45, flipPoints } from './vectorUtils.js'

export function Shape(type, centroid, orientation, flipped, vertices, area) {
  this.type=type;
  this.centroid = centroid;
  this.centroidOrig = centroid;
  this.orientation = orientation;
  this.orientationOrig = orientation;
  this.flipped = flipped;
  this.vertices = vertices;
  this.area = area;
  this.move = this.move.bind(this);
}


Shape.prototype.move = function (translate = [0, 0]) {

  this.centroid = this.centroid.map((coord, idx) => coord + translate[idx]);
  this.vertices = this.vertices.map(
    vtx => vtx.map((coord, idx) => coord + translate[idx])
  )
}

Shape.prototype.snapRotate = function (angle = 0, rotationPt = this.centroid) {

  const deg = snapTo45(this.orientation + angle) - snapTo45(this.orientation)
  this.vertices = rotatePoints(deg, this.vertices, rotationPt)
  this.orientation += angle;
}

Shape.prototype.flipPoints = function (rotationPt = this.centroid) {
  this.vertices = flipPoints(this.vertices, rotationPt).reverse()
  this.orientation =180 - this.orientation;
}

Shape.prototype.calcCentroid = function (vertices) {
  return vertices.reduce((acc, ele) => acc.map((e, idx) => e + ele[idx]))
    .map(ele => ele / (this.vertices.length));
}

