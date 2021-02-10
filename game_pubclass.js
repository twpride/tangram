import { move, rotate, snapTo45, flipPoints } from "./shape.js"
import { shapeGeoms } from "./shapeGeoms.js"
import { insidePoly, cross, calcPenetration } from "./vectorUtils.js"
import { problems } from './problemsData.js'
import { Timer } from './timer.js'

class TangramGame {

  tL = 100;
  shapeGeoms = shapeGeoms(this.tL);
  totArea = this.shapeGeoms.reduce((acc, ele) => acc + ele.area, 0);

  container = document.getElementById('canv');
  canvasWH = [container.clientWidth, container.clientHeight];
  canvas = document.createElement('canvas');
  // canvas.oncontextmenu = () => false;
  
  canvas.width = canvasWH[0];
  canvas.height = canvasWH[1];
  ctx = canvas.getContext("2d");
  container.appendChild(canvas);


  silCanvWH = [900, 900];
  silContainer = document.getElementById('silcanvas');
  silCanvas = document.createElement('canvas')
  silCanvas.width = silCanvWH[0];
  silCanvas.height = silCanvWH[1];
  silCtx = silCanvas.getContext('2d');
  silContainer.appendChild(this.silCanvas);
  ofc = document.createElement('canvas')
  ofc.width = silCanvWH[0];
  ofc.height = silCanvWH[1];
  octx = ofc.getContext('2d');


  thumbContainer = document.getElementById('pcanv');
  thumbCanvasWH = [thumbContainer.clientWidth, thumbContainer.clientHeight];
  thumbCanvas = document.createElement('canvas')
  thumbCanvas.width = thumbCanvasWH[0];
  thumbCanvas.height = thumbCanvasWH[1];
  thumbCtx = thumbCanvas.getContext('2d');
  thumbContainer.appendChild(thumbCanvas);


  animating = false
  liftedPiece = false;
  saveBoard = false;


  canvas.addEventListener('mousedown', e => this.onClickCanvas(e))


  timerEle = document.getElementById('timer');
  timer = new Timer(this.timerEle);



  let times;
  if (times = localStorage.getItem('times')) {
    times = JSON.parse(times);
  } else {
    times = []
  }


  this.selectEle = document.getElementById('probSelect');
  // this.probNum = -1;
  for (let i = 0; i < problems.length; i++) {
    const choice = document.createElement('option');
    choice.innerHTML = i + 1;
    choice.value = i;
    this.selectEle.appendChild(choice)
  }
  this.selectEle.addEventListener('change', (e) => {
    this.timer.stop()

    if (this.saveBoard) {
      localStorage.setItem(this.probNum, JSON.stringify(this.shapes))
    }
    if (this.timer.elapsed_S > 0) {
      localStorage.setItem(`t_${this.probNum}`, this.timer.total_S)
    }

    this.probNum = parseInt(this.selectEle.value);

    this.timer.reset(
      parseInt(localStorage.getItem(`t_${this.probNum}`)) || 0
    )

    this.loadProb()
  })



  this.shapes = JSON.parse(JSON.stringify(this.shapeGeoms))
  this.updateCentroidTot();

  this.img = new Image();
  this.img.src = 'woodTexture.jpeg';
  this.img.onload = () => {
    this.pattern = this.ctx.createPattern(this.img, 'repeat');
    this.renderLoop()
  };


  this.onShapeMove = this.onShapeMove.bind(this);
  this.onShapeRotate = this.onShapeRotate.bind(this);
  this.onFlipCommand = this.onFlipCommand.bind(this);


  this.onShapeMoveEnd = (e) => {
    this.liftedPiece = false;
    this.canvas.removeEventListener('mousemove', this.onShapeMove)
    this.movingShapeIdx = null;

    this.updateCentroidTot()
    this.canvas.removeEventListener('mouseup', this.onShapeMoveEnd)
    this.animating = false
  }
  
}


TangramGame.prototype.resetBoard = function () {
  localStorage.removeItem(this.probNum);
  this.shapes = JSON.parse(JSON.stringify(this.shapeGeoms))
  this.updateCentroidTot();
  this.saveBoard = false;
}

TangramGame.prototype.loadProb = function () {
  // if (this.sum > 5000) {
  //   this.timer.stop()
  //   this.timer.reset()
  // }

  let shapeString;
  if (shapeString = localStorage.getItem(this.probNum)) {
    this.shapes = JSON.parse(shapeString)
  } else {
    this.shapes = JSON.parse(JSON.stringify(this.shapeGeoms))
    this.saveBoard = false;
  }
  this.updateCentroidTot();

  let prob = problems[this.probNum]
  window.prob = prob;
  let factor = Math.sqrt(this.totArea / prob[prob.length - 2])
  this.bounds = prob[prob.length - 1]

  const thumbFactor = 0.8 * (this.thumbCanvasWH[0] / 2) / Math.max(...this.bounds.map(a => Math.abs(a)))


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
      ele / 2 + prob[i][idx] * thumbFactor
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
  this.renderLoop()
}

TangramGame.prototype.renderLoop = function () {
  this.ctx.fillStyle = "white";
  this.ctx.strokeStyle = 'grey'
  this.ctx.fillRect(0, 0, ...this.canvasWH);
  this.ctx.strokeRect(0, 0, ...this.canvasWH);

  this.silCtx.drawImage(this.ofc, 0, 0);

  for (let i = 0; i < this.shapes.length; i++) {
    const shape = this.shapes[i];

    this.ctx.beginPath(); this.silCtx.beginPath();
    this.ctx.moveTo(
      ...shape.vertices[0]
    )
    this.silCtx.moveTo(
      ...shape.vertices[0].map((ele, idx) => ele - this.centroidTot[idx] + this.silCanvWH[idx] / 2)
    )
    for (let j = 1; j < shape.vertices.length; j++) {
      this.ctx.lineTo(...shape.vertices[j])
      this.silCtx.lineTo(...shape.vertices[j].map(
        (ele, idx) => ele - this.centroidTot[idx] + this.silCanvWH[idx] / 2
      )
      )
    }
    this.ctx.closePath(); this.silCtx.closePath();


    this.ctx.fillStyle = this.pattern;
    this.ctx.save()
    if (this.liftedPiece && i == this.shapes.length - 1) this.ctx.globalAlpha = 0.5;
    const trans = shape.centroid.map((ele, idx) => ele - shape.centroidOrig[idx])
    this.ctx.translate(...trans)
    this.ctx.translate(...shape.centroidOrig)
    this.ctx.rotate((shape.orientation - shape.orientationOrig) * Math.PI / 180)
    this.ctx.translate(...shape.centroidOrig.map(ele => -ele))
    this.ctx.fill()
    this.ctx.restore()

    this.silCtx.fillStyle = 'black'
    this.silCtx.fill()


    // this.ctx.fillStyle = 'black';
    // this.ctx.strokeStyle = '#A0A0A0'
    // this.ctx.lineWidth = 1;
    // this.ctx.stroke()

    // this.ctx.fillStyle = 'red';
    // this.ctx.fillRect(...shape.centroid,4,4)
  }

  const arr = this.silCtx.getImageData(0, 0, 900, 900).data;
  this.sum = 0;
  for (let i = 0; i < arr.length; i += 4) {
    this.sum += arr[i]
  }

  if (this.sum > 5000) {
    this.timer.start()
  } else {
    this.timer.stop()
  }

  this.ctx.fillStyle = 'red';
  this.ctx.fillRect(...this.centroidTot, 2, 2)
  this.ctx.fillText(this.sum.toString(), 50, 50);

  if (this.animating) {
    requestAnimationFrame(() => this.renderLoop());
  }
}



TangramGame.prototype.onClickCanvas = function (e) {

  const coord = [
    e.clientX - this.canvas.getBoundingClientRect().left,
    e.clientY - this.canvas.getBoundingClientRect().top,
  ];

  for (let i = this.shapes.length - 1; i >= 0; i--) {
    const shape = this.shapes[i];
    if (!insidePoly(shape.vertices, coord)) continue;

    if (e.which != 3 && e.detail >= 2) {
      this.shapes.push(...this.shapes.splice(i, 1))
      this.liftedPiece = true;
      this.movingShapeIdx = this.shapes.length-1;
    } else {
      this.movingShapeIdx = i;
    }

    this.animating = true;
    this.renderLoop()



    const onShapeRotateEnd = (e) => {
      this.canvas.removeEventListener('mousemove', this.onShapeRotate)
      document.removeEventListener('keydown', this.onFlipCommand)
      snapTo45(shape)
      this.canvas.removeEventListener('mouseup', onShapeRotateEnd)
      this.animating = false
    }

    if (e.which === 3) {
      this.canvas.addEventListener('mousemove', this.onShapeRotate)
      document.addEventListener('keydown', this.onFlipCommand)
      this.canvas.addEventListener('mouseup', onShapeRotateEnd)
    } else {
      this.canvas.addEventListener('mousemove', this.onShapeMove)
      this.canvas.addEventListener('mouseup', this.onShapeMoveEnd)
    }
    break;
  }

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

  // iterate thru all static shapes, find worst case penetration in x and y
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


TangramGame.prototype.onShapeMove = function (e_drag) {
  // const onShapeMove = (e_drag) => {
  const shape = this.shapes[this.movingShapeIdx]
  const delta = [e_drag.movementX, e_drag.movementY]
  move(shape, delta)
  if (!this.liftedPiece) {
    move(shape, this.checkCollisions(this.movingShapeIdx, delta))
  }
  this.saveBoard = true;
}

TangramGame.prototype.onShapeRotate = function (e) {
  // const onShapeRotate = (e) => {
  const shape = this.shapes[this.movingShapeIdx]
  const coord = [
    e.clientX - this.canvas.getBoundingClientRect().left,
    e.clientY - this.canvas.getBoundingClientRect().top,
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

  rotate(shape, angle)
  this.saveBoard = true;
}

TangramGame.prototype.onFlipCommand = function (e) {
  // const onFlipCommand = (e) => {
  const shape = this.shapes[this.movingShapeIdx]
  if (e.key == " ") {
    flipPoints(shape)
  }
}