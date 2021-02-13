import { move, rotate, snapTo45, flipPoints } from "./shape.js"
import { shapeGeoms } from "./shapeGeoms.js"
import { insidePoly, cross, calcPenetration } from "./vectorUtils.js"
import { problems } from './problemsData.js'
import { setNode, setClassNodes } from './util.js'
import { Timer } from './timer.js'

export function TangramGame() {

  this.animating = false
  this.backgroundcolor = '#cccccc'
  document.getElementById("canv").style.backgroundColor = this.backgroundcolor

  setClassNodes('playpause', {
    width: 50, height: 50,
  })

  setClassNodes('playPauseFill', {
    fill: this.backgroundcolor
  })


  this.menuEle = document.getElementById('menu');

  this.tL = 100;
  this.shapeGeoms = shapeGeoms(this.tL)
  this.totArea = this.shapeGeoms.reduce((acc, ele) => acc + ele.area, 0);

  this.canvasWH = [1190, 790];
  this.canvas = setNode('mainCanvas', {
    width: this.canvasWH[0],
    height: this.canvasWH[1],
  })
  this.canvas.oncontextmenu = () => false;

  this.ctx = this.canvas.getContext("2d");
  Object.assign(this.canvas.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    margin: 'auto',
  });


  this.silCanvWH = [900, 900];
  // this.silContainer = document.getElementById('silcanvas');
  this.silCanvas = document.createElement('canvas')
  this.silCanvas.width = this.silCanvWH[0];
  this.silCanvas.height = this.silCanvWH[1];
  this.silCtx = this.silCanvas.getContext('2d');
  // this.silContainer.appendChild(this.silCanvas);

  this.ofc = document.createElement('canvas')
  this.ofc.width = this.silCanvWH[0];
  this.ofc.height = this.silCanvWH[1];
  this.octx = this.ofc.getContext('2d');

  // this.thumbContainer = document.getElementById('pcanv');
  this.thumbCanvasWH = [250, 250];
  this.thumbCanvas = document.createElement('canvas')
  this.thumbCanvas.width = this.thumbCanvasWH[0];
  this.thumbCanvas.height = this.thumbCanvasWH[1];
  this.thumbCtx = this.thumbCanvas.getContext('2d');
  this.thumbLeftTopOffset = [40, 40];
  // this.thumbContainer.appendChild(this.thumbCanvas);

  this.previewCanvasWH = [270, 270];
  this.previewCanvas = document.createElement('canvas')
  this.previewCanvas.width = this.previewCanvasWH[0];
  this.previewCanvas.height = this.previewCanvasWH[1];
  this.previewCtx = this.previewCanvas.getContext('2d');
  this.previewCanvas.style.zIndex = 50;
  this.menuEle.append(this.previewCanvas)
  Object.assign(this.previewCanvas.style, {
    position: 'absolute',
    left: this.thumbLeftTopOffset[0] + 5 + 'px',
    top: this.thumbLeftTopOffset[1] + 5 + 'px',
  });



  this.liftedPiece = false;
  this.saveBoard = false;
  this.timer = new Timer(document.getElementById('timer'));


  let times;
  if (times = localStorage.getItem('times')) {
    this.times = JSON.parse(times);
  } else {
    this.times = []
  }


  this.loadProb(-1)


  this.img = new Image();
  this.img.src = 'woodTexture.jpeg';
  this.img.onload = () => {
    this.pattern = this.ctx.createPattern(this.img, 'repeat');
    requestAnimationFrame(this.renderLoop)
  };




  this.onShapeMove = this.onShapeMove.bind(this);
  this.onShapeRotate = this.onShapeRotate.bind(this);
  this.onShapeMoveEnd = this.onShapeMoveEnd.bind(this);
  this.onShapeRotateEnd = this.onShapeRotateEnd.bind(this);
  this.onClickCanvas = this.onClickCanvas.bind(this);
  this.renderLoop = this.renderLoop.bind(this);



  document.addEventListener('keydown', e => {
    let pn = this.probNum;
    if (e && e.code == 'ArrowLeft' && this.probNum > 0) {
      this.stopTimerSaveProgress()
      pn -= 1;
    } else if (e && e.code == 'ArrowRight' && this.probNum < problems.length - 1) {
      this.stopTimerSaveProgress()
      pn += 1;
    } else {
      return;
    }
    this.loadProb(pn)
    requestAnimationFrame(this.renderLoop)
  })

  this.canvas.addEventListener('mousedown', this.onClickCanvas)

  window.addEventListener('beforeunload', () => {
    this.stopTimerSaveProgress()
    localStorage.setItem('times', JSON.stringify(this.times))
  })

  document.getElementById("pauseButton").addEventListener('click', (e) => {
    this.stopTimerSaveProgress()

    this.menuEle.style.display = 'block';

    this.previewLoop()
  })

  document.addEventListener('keydown', (e) => {
    if (e.key != 'Escape') return;
    if (this.menuEle.style.display == 'block') {
      this.menuEle.style.display = 'none';
    } else {
      this.stopTimerSaveProgress()
      this.menuEle.style.display = 'block';
    }
  })

  document.getElementById('playButton').addEventListener('click', () => {
    console.log('clicckeedd')
    this.menuEle.style.display = 'none';
  })
}


TangramGame.prototype.stopTimerSaveProgress = function () {
  this.timer.stop()
  if (this.saveBoard) {
    localStorage.setItem(this.probNum, JSON.stringify(this.shapes))
  }
  this.times[this.probNum] = [this.timer.total_S, this.sum];
}


TangramGame.prototype.resetBoard = function () {
  localStorage.removeItem(this.probNum);
  this.shapes = JSON.parse(JSON.stringify(this.shapeGeoms))
  this.updateCentroidTot();
  this.saveBoard = false;
}

TangramGame.prototype.loadProb = function (probNum) {
  this.probNum = probNum;

  document.getElementById('probnum').innerHTML = "#" + (probNum + 1);

  this.saveBoard = false;
  let shapeString;
  if (shapeString = localStorage.getItem(probNum)) {
    this.shapes = JSON.parse(shapeString)
  } else {
    this.shapes = JSON.parse(JSON.stringify(this.shapeGeoms))
  }
  this.updateCentroidTot();

  let prob = problems[probNum];
  if (!prob) return;

  this.timer.reset(
    this.times[this.probNum][0] || 0
  )

  let factor = Math.sqrt(this.totArea / prob[prob.length - 2])
  this.bounds = prob[prob.length - 1]

  const thumbFactor = 0.8 * (this.thumbCanvasWH[0] / 2) / Math.max(...this.bounds.map(a => Math.abs(a)))

  this.thumbCtx.clearRect(0, 0, ...this.thumbCanvasWH);

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

  this.thumbCtx.fillStyle = '#ad0f37';
  this.thumbCtx.fill()

  this.octx.fillStyle = '#01FFFF';
  this.octx.fill()



}

TangramGame.prototype.previewLoop = function () {
  this.previewCtx.fillStyle = this.backgroundcolor;
  this.previewCtx.fillRect(0, 0, ...this.previewCanvasWH)
  if (this.times[this.probNum][1] > 5000) {
    this.previewCtx.filter = `blur(14px)`
  } else {
    this.previewCtx.filter = `none`
  }
  this.previewCtx.drawImage(this.thumbCanvas, 0, 0);
}

TangramGame.prototype.renderLoop = function () {
  this.ctx.globalAlpha = 1;
  this.ctx.fillStyle = this.backgroundcolor;
  this.ctx.fillRect(0, 0, ...this.canvasWH);

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

    // this.ctx.fillStyle = 'red';
    // this.ctx.fillRect(...shape.centroid,4,4)
  }

  this.ctx.drawImage(this.thumbCanvas, ...this.thumbLeftTopOffset);

  const arr = this.silCtx.getImageData(0, 0, 900, 900).data;
  this.sum = 0;
  for (let i = 0; i < arr.length; i += 4) {
    this.sum += arr[i]
  }


  if (this.sum > 5000 && this.menuEle.style.display == 'none') {
    this.timer.start()
  } else {
    this.timer.stop()
  }

  this.ctx.fillStyle = 'green';
  // this.ctx.fillRect(...this.centroidTot, 2, 2)
  this.ctx.fillText(this.sum.toString(), 50, 550);
  this.ctx.fillText(this.probNum.toString(), 50, 500);

  if (this.animating) {



    requestAnimationFrame(this.renderLoop);
  }
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

TangramGame.prototype.updateCentroidTot = function () {
  this.centroidTot = this.shapes.reduce(
    (acc, ele) => acc.map(
      (e, idx) => e + ele.centroid[idx] * ele.area
    ),
    [0, 0]
  ).map(ele => ele / this.totArea)
}

TangramGame.prototype.onClickCanvas = function (e) {
  const coord = [
    e.clientX - this.canvas.getBoundingClientRect().left,
    e.clientY - this.canvas.getBoundingClientRect().top,
  ];

  for (let i = this.shapes.length - 1; i >= 0; i--) {
    const shape = this.shapes[i];
    if (!insidePoly(shape.vertices, coord)) continue;
    this.movingShapeIdx = i;

    // if (e.which != 3) { // left, middle, click
    if (e.button != 2) { // left, middle, click
      if (e.detail >= 2) { // double + click
        this.shapes.push(...this.shapes.splice(i, 1))
        this.liftedPiece = true;
        this.movingShapeIdx = this.shapes.length - 1;
      }
      this.canvas.addEventListener('mousemove', this.onShapeMove)
      this.canvas.addEventListener('mouseup', this.onShapeMoveEnd)
    } else { // right click
      if (e.detail == 2) { // double
        flipPoints(shape)
      }
      this.canvas.addEventListener('mousemove', this.onShapeRotate)
      this.canvas.addEventListener('mouseup', this.onShapeRotateEnd)
    }

    this.animating = true;
    // this.renderLoop()
    requestAnimationFrame(this.renderLoop)
    break;
  }

}

TangramGame.prototype.onShapeMoveEnd = function (e) {
  this.liftedPiece = false;
  this.updateCentroidTot()
  this.canvas.removeEventListener('mousemove', this.onShapeMove)
  this.canvas.removeEventListener('mouseup', this.onShapeMoveEnd)
  this.animating = false
}

TangramGame.prototype.onShapeRotateEnd = function (e) {
  snapTo45(this.shapes[this.movingShapeIdx])
  this.canvas.removeEventListener('mousemove', this.onShapeRotate)
  this.canvas.removeEventListener('mouseup', this.onShapeRotateEnd)
  this.animating = false
}

TangramGame.prototype.onShapeMove = function (e) {
  const shape = this.shapes[this.movingShapeIdx];
  const delta = [e.movementX, e.movementY];
  move(shape, delta);
  if (!this.liftedPiece) {
    move(shape, this.checkCollisions(this.movingShapeIdx, delta));
  }
  this.saveBoard = true;
}

TangramGame.prototype.onShapeRotate = function (e) {
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
