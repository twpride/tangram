import { Shape } from "./shape.js"
import { tL, shapeGeoms } from "./shapeGeoms.js"
import { insidePoly, cross, calcPenetration, snapTo45 } from "./vectorUtils.js"

export function TangramGame() {
  this.container = document.getElementById('canv');
  this.canvas = document.createElement('canvas');
  this.canvas.width = this.container.clientWidth;
  this.canvas.height = this.container.clientHeight;
  this.xyMax = [this.canvas.width, this.canvas.height];
  this.ctx = this.canvas.getContext("2d");
  this.container.appendChild(this.canvas);
  this.rect = this.canvas.getBoundingClientRect();
  this.clear = true;
  this.liftedPiece = new Set()
  this.selectedArea = null;


  this.snapAngles = [
    0, 9, 12, 15, 18, 24
  ]

  this.shapes = shapeGeoms.map(
    obj => {
      console.log(obj)
      obj.vertices = obj.vertices.map(ele => [ele[0] + 2 * tL, ele[1] + 2 * tL])
      obj.centroid = [obj.centroid[0] + 2 * tL, obj.centroid[1] + 2 * tL];
      const shape = new Shape(...Object.values(obj));
      // shape.move([1 * tL, 1 * tL]);
      shape.rect= this.rect;
      return shape;
    }
  );

  this.onClickCanvas = this.onClickCanvas.bind(this);
  this.canvas.addEventListener('mousedown', this.onClickCanvas)



  this.img = new Image();
  this.img.src = 'https://images.creativemarket.com/0.1.0/ps/1847013/300/200/m2/fpc/wm0/rj4vmxb5iztaaukfifmcjlk5ku99oiwv5yy4fwacx8ndcwpoudfyd2mtjdu5upc8-.jpg?1478261816&s=6dda4b70d21ef3998a2603682716f426';

  this.img.onload = () => {
    this.pattern = this.ctx.createPattern(this.img, 'repeat');
  };



}

TangramGame.prototype.gameLoop = function () {
  if (this.clear) {
    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = 'grey'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  for (let i = 0; i < this.shapes.length; i++) {
    this.ctx.beginPath();
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

    this.ctx.strokeStyle = 'white'
    this.ctx.fillStyle = this.pattern;
    this.ctx.lineWidth = 1;
    this.ctx.stroke()


    let trans = shape.centroid.map((ele, idx) => ele - shape.centroidOrig[idx])

    this.ctx.save()

    if (this.liftedPiece.has(i)) {
      this.ctx.globalAlpha = 0.5;
    }
    this.ctx.translate(...trans)

    this.ctx.translate(...shape.centroidOrig)
    this.ctx.rotate(snapTo45(shape.orientation-shape.orientationOrig) * Math.PI / 180)
    this.ctx.translate(...shape.centroidOrig.map(ele => -ele))

    this.ctx.fill()

    this.ctx.restore()

    // this.ctx.fillStyle = 'red';
    // this.ctx.fillRect(...shape.centroid,4,4)
  }


  const func = this.gameLoop.bind(this);
  requestAnimationFrame(func);
}



TangramGame.prototype.onClickCanvas = function (e) {

  const coord = [
    e.clientX - this.rect.left,
    e.clientY - this.rect.top,
  ];
  let clickedShape = false;
  for (let i = this.shapes.length - 1; i >= 0; i--) {
    const shape = this.shapes[i];
    const res = insidePoly(shape.vertices, coord);
    if (!res) continue;

    if (e.detail >= 2) {
      this.shapes.push(...this.shapes.splice(i, 1))
      this.liftedPiece.add(this.shapes.length - 1)
    }

    const onShapeMove = (e_drag) => {
      const delta = [e_drag.movementX, e_drag.movementY]
      shape.move(delta)
      if (e.detail < 2) {
        shape.move(this.checkCollisions(i, delta))
      }
    }

    const onShapeRotate = (e) => {
      // console.log(e)
      const coord = [
        e.clientX - this.rect.left,
        e.clientY - this.rect.top,
      ];
      const prevCoord = [
        coord[0] - e.movementX, 
        coord[1] - e.movementY
      ]

      let start = [];
      let end = [];
      for (let idx = 0; idx < 2; idx++) {
        start[idx] = prevCoord[idx] - shape.centroid[idx];
        end[idx] = coord[idx] - shape.centroid[idx];
      }

      const angle = Math.asin(
        cross(start, end) / Math.sqrt(
          (start[0] ** 2 + start[1] ** 2) *
          (end[0] ** 2 + end[1] ** 2)
        )
      ) / Math.PI * 180;

      shape.snapRotate(angle)
    }

    const onFlipCommand = (e) => {
      // console.log(e)
      if (e.key == " ") {
        shape.flipPoints()
      }
    }
    const onShapeMoveEnd = (e) => {
      this.liftedPiece.delete(this.shapes.length - 1)
      this.canvas.removeEventListener('mousemove', onShapeMove)
      this.canvas.removeEventListener('mousemove', onShapeRotate)
      this.canvas.removeEventListener('mouseup', onShapeMoveEnd)
      document.removeEventListener('keydown', onFlipCommand)

      shape.orientation = snapTo45(shape.orientation)
    }

    if (e.which === 2) {
      this.canvas.addEventListener('mousemove', onShapeRotate)
      document.addEventListener('keydown', onFlipCommand)
      this.canvas.addEventListener('mouseup', onShapeMoveEnd)
    } else {
      this.canvas.addEventListener('mousemove', onShapeMove)
      this.canvas.addEventListener('mouseup', onShapeMoveEnd)
    }
    clickedShape = true;
    break;
  }

  // if (!clickedShape) {
  //   this.canvas.addEventListener('mousemove', onSelectMove)
  //   this.canvas.addEventListener('mouseup', onSelectMoveEnd)
  // }

}

TangramGame.prototype.checkCollisions = function (movingShapeIdx, delta) {
  const moveBack = [0, 0]

  const movingShapePts = this.shapes[movingShapeIdx].vertices;

  delta = delta.map(ele => ele * 1.2)

  for (let i = 0; i < this.shapes.length; i++) {
    if (i === movingShapeIdx) continue;
    const shapePts = this.shapes[i].vertices;

    for (let j = 0; j < shapePts.length; j++) { // static pts inside moving
      if (insidePoly(movingShapePts, shapePts[j])) {
        const u = calcPenetration(movingShapePts, shapePts[j], delta)
        if (!u) continue;

        u.forEach((ele, idx) => {
          if (Math.abs(moveBack[idx]) < Math.abs(ele)) {
            moveBack[idx] = (-ele < 0 ? -1 : 1) * Math.max(Math.abs(moveBack[idx]), Math.abs(ele))
          }
        })
      }
    }

    for (let j = 0; j < movingShapePts.length; j++) { //moving pts inside static
      if (insidePoly(shapePts, movingShapePts[j])) {
        const u = calcPenetration(shapePts, movingShapePts[j], delta.map(ele => -1 * ele));
        if (!u) continue;
        u.forEach((ele, idx) => {
          if (Math.abs(moveBack[idx]) < Math.abs(ele)) {
            moveBack[idx] = (ele < 0 ? -1 : 1) * Math.max(Math.abs(moveBack[idx]), Math.abs(ele))
          }
        })
      }
    }

  }
  return moveBack;
}

