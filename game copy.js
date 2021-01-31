import { Shape } from "./shape.js"
import { tL, shapeGeoms } from "./shapeGeoms.js"
import { insidePoly, calcCentroid, vecAdd, cross, toVec, findIntersection, calcPenetration } from "./vectorUtils.js"

export function TangramGame() {
  this.container = document.getElementById('canv');
  this.canvas = document.createElement('canvas');
  this.canvas.width = this.container.clientWidth;
  this.canvas.height = this.container.clientHeight;
  this.xyMax = [this.canvas.width, this.canvas.height];
  this.ctx = this.canvas.getContext("2d");
  this.container.appendChild(this.canvas);
  this.rect = this.canvas.getBoundingClientRect();
  this.clickPos = null;
  this.clear = true;

  this.snapAngles = [
    0, 9, 12, 15, 18, 24
  ]

  this.shapes = shapeGeoms.map(
    geom => {
      const shape = new Shape(geom);
      shape.move([4 * tL, 4 * tL]);
      shape.centroid = calcCentroid(shape.vertices);
      return shape;
    }
  );

  this.onClickCanvas = this.onClickCanvas.bind(this);
  this.canvas.addEventListener('mousedown', this.onClickCanvas)
}
TangramGame.prototype.toggle = function () {
  this.clear = this.clear ? false : true;
}

TangramGame.prototype.gameLoop = function () {
  this.ctx.fillStyle = "lightgrey";
  if (this.clear) this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.beginPath();
  this.drawShapes()
  requestAnimationFrame(this.gameLoop.bind(this));
}

TangramGame.prototype.drawShapes = function () {
  for (let i = 0; i < this.shapes.length; i++) {
    const shape = this.shapes[i];
    this.ctx.moveTo(
      ...shape.vertices[0]
    )
    for (let j = 1; j < shape.vertices.length; j++) {
      this.ctx.lineTo(
        ...shape.vertices[j]
      )
    }
    this.ctx.closePath()

    this.ctx.strokeStyle = 'red'
    this.ctx.lineWidth = 1;
    this.ctx.stroke()
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(...shape.centroid, 2, 2)
  }

  if (this.ct) {
    for (let i = 0; i < this.ct.length; i++) {
      this.ctx.fillStyle = "green";
      this.ctx.fillRect(...this.ct[i], 6, 6)
    }
    for (let i = 0; i < this.pt.length; i++) {
      this.ctx.fillStyle = "green";
      this.ctx.fillRect(...this.pt[i], 6, 6)
    }
  }
}

TangramGame.prototype.checkCollisions = function (movingShapeIdx, delta) {
  const vertices = this.shapes[movingShapeIdx].vertices
  let prev = cross(toVec(vertices[vertices.length - 1], vertices[0]), delta);
  const final = prev;
  const updateRange = [];
  let i = 0;
  for (; i < vertices.length - 1; i++) {
    let curr = cross(toVec(vertices[i], vertices[i + 1]), delta);
    if (prev <= 0 && curr > 0) {
      updateRange[0] = i;
    } else if (prev > 0 && curr <= 0) {
      updateRange[1] = i;
    }
    prev = curr;
  }
  if (prev <= 0 && final > 0) {
    updateRange[0] = i;
  } else if (prev > 0 && final <= 0) {
    updateRange[1] = i;
  }

  let movingShapePts = [];
  if (updateRange[0] < updateRange[1]) {
    for (let i = updateRange[0]; i < updateRange[1]; i++) {
      movingShapePts.push(vertices[i].map(ele => vecAdd(ele, delta)))
    }
  } else {
    for (let i = updateRange[0]; i < vertices.length; i++) {
      movingShapePts.push(vertices[i].map(ele => vecAdd(ele, delta)))
    }
    for (let i = 0; i < updateRange[1] + 1; i++) {
      movingShapePts.push(vertices[i].map(ele => vecAdd(ele, delta)))
    }
  }

  // const movingShapePts = this.shapes[movingShapeIdx].vertices;

  let ct = [];
  let pt = [];

  for (let i = 0; i < this.shapes.length; i++) {
    if (i === movingShapeIdx) continue;
    const shapePts = this.shapes[i].vertices;

    for (let j = 0; j < shapePts.length; j++) { // static pts inside moving
      if (insidePoly(movingShapePts, shapePts[j])) {
        const u = calcPenetration(movingShapePts, shapePts[j], delta)
        pt.push(shapePts[j])
        ct.push(
          // [shapePts[j],
          vecAdd(
            shapePts[j],
            delta.map(ele => ele * u)
            // delta.map(ele => ele)
          )
          // ]
        )
      }
    }

    for (let j = 0; j < movingShapePts.length; j++) { //moving pts inside static
      if (insidePoly(shapePts, movingShapePts[j])) {
        const u = calcPenetration(shapePts, movingShapePts[j], delta.map(e => -e));
        pt.push(movingShapePts[j])
        ct.push(
          // [movingShapePts[j],
          vecAdd(
            movingShapePts[j],
            delta.map(
              ele => ele * -1 * u
              // ele => ele * -1
            )
          )
          // ]
        )
      }
    }

  }
  console.log(ct)
  this.ct = ct;
  this.pt = pt;
}


TangramGame.prototype.onClickCanvas = function (e) {
  const coord = [
    e.clientX - this.rect.left,
    e.clientY - this.rect.top,
  ];

  for (let i = 0; i < this.shapes.length; i++) {
    const shape = this.shapes[i];
    const res = insidePoly(shape.vertices, coord);
    if (res) {
      // this.shapes.splice(0, 0, this.shapes.splice(i, 1)[0])
      this.clickPos = coord;

      const onShapeMove = (e) => {
        const coord = [
          e.clientX - this.rect.left,
          e.clientY - this.rect.top,
        ];
        const delta = coord.map((ele, idx) => ele - this.clickPos[idx]);
        shape.move(delta)
        this.checkCollisions(i, delta)
        this.clickPos = coord;
      }
      const onShapeMoveEnd = (e) => {
        shape.centroid = calcCentroid(shape.vertices);
        this.canvas.removeEventListener('mousemove', onShapeMove)
        this.canvas.removeEventListener('mouseup', onShapeMoveEnd)
      }

      this.canvas.addEventListener('mousemove', onShapeMove)
      this.canvas.addEventListener('mouseup', onShapeMoveEnd)
      break;
    }
  }
}