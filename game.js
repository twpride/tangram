import { Shape } from "./shape.js"
import { shapeGeoms } from "./shapeGeoms.js"
import { insidePoly, cross, calcPenetration, snapTo45 } from "./vectorUtils.js"
import { problems } from './problemsData.js'

export function TangramGame() {
  this.container = document.getElementById('canv');
  this.canvasWH = [this.container.clientWidth, this.container.clientHeight];
  this.canvas = document.createElement('canvas');
  this.canvas.oncontextmenu = () => false;
  this.canvas.width = this.canvasWH[0];
  this.canvas.height = this.canvasWH[1];
  this.ctx = this.canvas.getContext("2d");
  this.container.appendChild(this.canvas);
  
  this.tL = 100;

  this.silCanvWH = [900, 900];

  this.silContainer = document.getElementById('silcanvas');
  this.silCanvas = document.createElement('canvas')
  this.silCanvas.width = this.silCanvWH[0];
  this.silCanvas.height = this.silCanvWH[1];
  this.silCtx = this.silCanvas.getContext('2d');
  this.silContainer.appendChild(this.silCanvas);

  this.ofc = document.createElement('canvas')
  this.ofc.width = this.silCanvWH[0];
  this.ofc.height = this.silCanvWH[1];
  this.octx = this.ofc.getContext('2d');



  this.thumbContainer = document.getElementById('pcanv');
  this.thumbCanvasWH = [this.thumbContainer.clientWidth, this.thumbContainer.clientHeight];
  this.thumbCanvas = document.createElement('canvas')
  this.thumbCanvas.width = this.thumbCanvasWH[0];
  this.thumbCanvas.height = this.thumbCanvasWH[1];
  this.thumbCtx = this.thumbCanvas.getContext('2d');
  this.thumbContainer.appendChild(this.thumbCanvas);


  this.rect = this.canvas.getBoundingClientRect();
  this.liftedPiece = new Set()

  this.selectedArea = null;


  this.canvas.addEventListener('mousedown', e => this.onClickCanvas(e))


  this.img = new Image();
  this.img.src = 'woodTexture.jpeg';

  this.img.onload = () => {
    this.pattern = this.ctx.createPattern(this.img, 'repeat');
  };


  document.addEventListener('keydown', e => this.loadNext(e))

  this.probNum = 0;
  this.loadNext()
}


TangramGame.prototype.loadNext = function (e) {
  if (e && e.code == 'ArrowLeft' && this.probNum > 0) {
    this.probNum -= 1;
  } else if (e && e.code == 'ArrowRight' && this.probNum < problems.length - 1) {
    this.probNum += 1;
  }


  this.totArea = 0;

  this.shapes = shapeGeoms(this.tL).map(
    obj => {
      obj.vertices = obj.vertices.map(ele => [ele[0] + 2 * this.tL, ele[1] + 2 * this.tL])
      obj.centroid = [obj.centroid[0] + 2 * this.tL, obj.centroid[1] + 2 * this.tL];
      const shape = new Shape(...Object.values(obj));
      this.totArea += obj.area
      return shape;
    }
  );

  this.updateCentroidTot();


  let prob = problems[this.probNum]

  let factor = Math.sqrt(this.totArea / prob[prob.length - 2])
  this.bounds = prob[prob.length - 1]

  // console.log(
  //   Math.max(...this.bounds.map(a => Math.abs(a)))
  // )


  this.thumbCtx.fillStyle = "white";
  this.thumbCtx.strokeStyle = 'grey'
  this.thumbCtx.fillRect(0, 0, ...this.thumbCanvasWH);
  this.thumbCtx.strokeRect(0, 0, ...this.thumbCanvasWH);

  this.octx.fillStyle = "black";
  this.octx.fillRect(0, 0, ...this.silCanvWH);


  this.thumbCtx.beginPath();
  this.octx.beginPath();
  for (let i = 0; i < prob.length - 2; i++) {
    if (isNaN(prob[i][0])) continue;

    const pdest = this.thumbCanvasWH.map((ele, idx) => (
      ele / 2 + prob[i][idx]
    ))

    const dest = this.silCanvWH.map((ele, idx) => (
      ele / 2 + prob[i][idx] * factor
    ))

    if (i == 0 || isNaN(prob[i - 1][0])) {
      this.octx.moveTo(...dest)
      this.thumbCtx.moveTo(...pdest)
    } else {
      this.octx.lineTo(...dest)
      this.thumbCtx.lineTo(...pdest)
    }
  }

  this.thumbCtx.fillStyle = 'black';
  this.thumbCtx.fill()

  this.octx.fillStyle = '#01FFFF';
  this.octx.fill()

}

TangramGame.prototype.gameLoop = function () {
  this.ctx.fillStyle = "white";
  this.ctx.strokeStyle = 'grey'
  this.ctx.fillRect(0, 0, ...this.canvasWH);
  this.ctx.strokeRect(0, 0, ...this.canvasWH);

  this.silCtx.drawImage(this.ofc, 0, 0);


  for (let i = 0; i < this.shapes.length; i++) {
    this.ctx.beginPath();
    this.silCtx.beginPath();

    const shape = this.shapes[i];
    this.ctx.moveTo(
      ...shape.vertices[0]
    )

    this.silCtx.moveTo(
      ...shape.vertices[0].map((ele, idx) => ele - this.centroidTot[idx] + this.silCanvWH[idx] / 2)
    )

    for (let j = 1; j < shape.vertices.length; j++) {
      this.ctx.lineTo(
        ...shape.vertices[j]
      )
      this.silCtx.lineTo(
        ...shape.vertices[j].map((ele, idx) => ele - this.centroidTot[idx] + this.silCanvWH[idx] / 2)
      )
    }
    this.ctx.closePath()
    this.silCtx.closePath()

    this.ctx.strokeStyle = 'white'
    this.ctx.fillStyle = this.pattern;
    this.ctx.lineWidth = 1;
    this.ctx.stroke()


    this.silCtx.fillStyle = 'black'


    let trans = shape.centroid.map((ele, idx) => ele - shape.centroidOrig[idx])

    this.ctx.save()

    if (this.liftedPiece.has(i)) {
      this.ctx.globalAlpha = 0.5;
    }
    this.ctx.translate(...trans)

    this.ctx.translate(...shape.centroidOrig)
    this.ctx.rotate(snapTo45(shape.orientation - shape.orientationOrig) * Math.PI / 180)
    this.ctx.translate(...shape.centroidOrig.map(ele => -ele))

    this.ctx.fill()
    this.silCtx.fill()

    this.ctx.restore()

    // this.ctx.fillStyle = 'red';
    // this.ctx.fillRect(...shape.centroid,4,4)
  }

  const arr = this.silCtx.getImageData(0, 0, 900, 900).data;
  let sum = 0;
  for (let i = 0; i < arr.length; i += 4) {
    sum += arr[i]
  }

  this.ctx.fillStyle = 'red';
  this.ctx.fillRect(...this.centroidTot, 2, 2)
  this.ctx.fillText(sum.toString(), 50, 50);

  requestAnimationFrame(()=>this.gameLoop());
}



TangramGame.prototype.onClickCanvas = function (e) {

  const coord = [
    e.clientX - this.rect.left,
    e.clientY - this.rect.top,
  ];
  // let clickedShape = false;
  for (let i = this.shapes.length - 1; i >= 0; i--) {
    const shape = this.shapes[i];
    const res = insidePoly(shape.vertices, coord);
    if (!res) continue;

    if (e.which != 3 && e.detail >= 2) {
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
      if (e.key == " ") {
        shape.flipPoints()
      }
    }
    const onShapeMoveEnd = (e) => {
      this.liftedPiece.delete(this.shapes.length - 1)
      this.canvas.removeEventListener('mousemove', onShapeMove)
      this.updateCentroidTot()
      this.canvas.removeEventListener('mouseup', onShapeMoveEnd)
    }

    const onShapeRotateEnd = (e) => {
      this.canvas.removeEventListener('mousemove', onShapeRotate)
      document.removeEventListener('keydown', onFlipCommand)
      shape.orientation = snapTo45(shape.orientation)

      this.canvas.removeEventListener('mouseup', onShapeRotateEnd)
    }

    if (e.which === 3) {
      this.canvas.addEventListener('mousemove', onShapeRotate)
      document.addEventListener('keydown', onFlipCommand)
      this.canvas.addEventListener('mouseup', onShapeRotateEnd)
    } else {
      this.canvas.addEventListener('mousemove', onShapeMove)
      this.canvas.addEventListener('mouseup', onShapeMoveEnd)
    }
    // clickedShape = true;
    break;
  }

  // if (!clickedShape) {
  //   this.canvas.addEventListener('mousemove', onSelectMove)
  //   this.canvas.addEventListener('mouseup', onSelectMoveEnd)
  // }

}

TangramGame.prototype.updateCentroidTot = function () {
  this.centroidTot = this.shapes.reduce(
    (acc, ele) => acc.map(
      (e, idx) => e + ele.centroid[idx] * ele.area
    ),
    [0, 0]
  ).map(ele => ele / this.totArea)
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

