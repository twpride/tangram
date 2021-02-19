import { move, rotate, snapTo45, flipPoints } from "./shape.js"
import { shapeGeoms } from "./shapeGeoms.js"
import { insidePoly, cross, calcPenetration } from "./vectorUtils.js"
import { problems } from './problemsData.js'
import { setNode, setClassNodes } from './util.js'
import { Timer } from './timer.js'
import { LevelSelector } from './levelSelector.js'

export function TangramGame() {

  this.animating = false
  this.backgroundcolor = '#cccccc'
  this.color1 = '#555'
  this.color2 = '#7e0000'

  this.container = document.getElementById('canv');
  this.canvas = document.getElementById('mainCanvas')
  this.canvas.oncontextmenu = () => false;
  this.ctx = this.canvas.getContext("2d");


  this.canvasWH = [this.container.clientWidth, this.container.clientHeight];
  this.canvas.width = this.canvasWH[0];
  this.canvas.height = this.canvasWH[1];
  this.tL = Math.min(...this.canvasWH) / 6;


  Object.assign(this.canvas.style, {
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
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

  this.liftedPiece = false;
  this.saveBoard = false;
  this.timer = new Timer(document.getElementById('timer'));


  let times;
  if (times = localStorage.getItem('times')) {
    this.times = JSON.parse(times);
  } else {
    this.times = []
  }


  const thumbCanvasH = 200;
  this.thumbCanvasWH = [thumbCanvasH, thumbCanvasH];

  this.thumbCanvas = document.createElement('canvas')
  this.thumbCanvas.width = this.thumbCanvasWH[0];
  this.thumbCanvas.height = this.thumbCanvasWH[1];
  this.thumbCtx = this.thumbCanvas.getContext('2d');


  setClassNodes('playpause', {
    width: 60, height: 60, fill: this.color2,
  })
  setNode('flipButton', {
    width: 60, height: 60, fill: this.color2
  })


  this.levelSelector = new LevelSelector(this, 40)

  this.thumbLeftTopOffset = []
  this.positionComps()
  this.loadProb(0)

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
  this.onTouchCanvas = this.onTouchCanvas.bind(this);
  this.positionComps = this.positionComps.bind(this);

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
  this.canvas.addEventListener('touchstart', this.onTouchCanvas)

  window.addEventListener('beforeunload', () => {
    this.stopTimerSaveProgress()
    localStorage.setItem('times', JSON.stringify(this.times))
  })


  this.menuEle = document.getElementById('menu');


  for (let ele of document.getElementsByClassName('canvButton')) {
    Object.assign(ele.style, { display: 'none' });
  }

  document.getElementById("pauseButton").addEventListener('click', (e) => {
    this.stopTimerSaveProgress()
    this.menuEle.style.display = 'block';

    for (let ele of document.getElementsByClassName('canvButton')) {
      Object.assign(ele.style, { display: 'none' });
    }

    requestAnimationFrame(this.renderLoop)
  })

  document.getElementById('playButton').addEventListener('click', () => {
    this.menuEle.style.display = 'none';

    for (let ele of document.getElementsByClassName('canvButton')) {
      Object.assign(ele.style, { display: 'block' });
    }

    requestAnimationFrame(this.renderLoop)
  })

  document.getElementById('flipButton').addEventListener('click', () => {
    for (let shape of this.shapes) {
      if (shape.type == 2) {
        flipPoints(shape)
        requestAnimationFrame(this.renderLoop)
        break;
      }
    }
  })


  document.addEventListener('keydown', (e) => {
    if (e.key != 'Escape') return;
    if (this.menuEle.style.display != 'none') {
      this.menuEle.style.display = 'none';

      for (let ele of document.getElementsByClassName('canvButton')) {
        Object.assign(ele.style, { display: 'block' });
      }


    } else {
      this.stopTimerSaveProgress()
      this.menuEle.style.display = 'block';

      for (let ele of document.getElementsByClassName('canvButton')) {
        Object.assign(ele.style, { display: 'none' });
      }

    }
    requestAnimationFrame(this.renderLoop)
  })

  let resizeTimeout;
  window.addEventListener('resize', (e) => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(
      () => {

        this.canvasWH = [this.container.clientWidth, this.container.clientHeight];
        this.canvas.width = this.canvasWH[0];
        this.canvas.height = this.canvasWH[1];

        this.positionComps()

        const newTL = Math.min(...this.canvasWH) / 8;
        this.reScaleShapes(newTL / this.tL)
        this.tL = newTL;

        this.rePositionShapes()
        this.updateCentroidTot();

        requestAnimationFrame(this.renderLoop)
      }
      , 100
    )
  })



}



TangramGame.prototype.stopTimerSaveProgress = function () {
  this.timer.stop()
  if (this.saveBoard) {
    localStorage.setItem(this.probNum, JSON.stringify([this.tL, ...this.shapes]))
  }
  this.times[this.probNum] = [this.timer.total_S, this.sum];


  let color;
  const timeFraction = this.timer.total_S / 300;

  let newProbState;
  if (this.sum < 5000) {
    const colAngle = 120 - Math.floor((timeFraction > 1 ? 1 : timeFraction) * 120);
    color = `hsl(${colAngle}, 100%, 50%)`
    newProbState = 2;
  } else {
    if (this.timer.total_S > 0) {
      const satPercent = Math.floor((timeFraction > 1 ? 1 : timeFraction) * 100);
      color = `hsl(240, ${satPercent}%, 73%)`
      newProbState = 1;
    } else {
      color = 'white';
      newProbState = 0;
    }
  }

  this.progress[this.probState] -= 1;
  this.progress[newProbState] += 1;

  this.levelSelector.selectorSvg.childNodes[this.probNum * 2].setAttribute('fill', color);


  document.getElementById('solvedString').children[2].textContent = this.progress[2].toString().padStart(3)
  document.getElementById('inProgressString').children[2].textContent = this.progress[1].toString().padStart(3)
  document.getElementById('notStartedString').children[2].textContent = this.progress[0].toString().padStart(3)
}


TangramGame.prototype.resetBoard = function () {
  localStorage.removeItem(this.probNum);
  this.shapes = JSON.parse(JSON.stringify(this.shapeGeoms))
  this.updateCentroidTot();
  this.saveBoard = false;
}

TangramGame.prototype.loadProb = function (probNum) {
  let prob; //silhouette data of problem
  if (probNum == undefined) {
    // use existing probNum a new one wasnt provided
    prob = problems[this.probNum]
  } else {
    if (!(prob = problems[probNum])) return; // return early if invalid probNum
    this.probNum = probNum;
    document.getElementById('probnum').innerHTML = '#' + (probNum + 1);

    this.timer.reset(
      (this.times[this.probNum] && this.times[this.probNum][0]) || 0
    )
    this.saveBoard = false;
  }


  // set tile positions, load from local storage if it was saved if not load default
  let shapeString, shapeTL;

  if (shapeString = localStorage.getItem(this.probNum)) {
    [shapeTL, ...this.shapes] = JSON.parse(shapeString)
    this.reScaleShapes(this.tL / shapeTL)
  } else {
    this.shapes = shapeGeoms(this.tL)
  }

  this.rePositionShapes()
  this.updateCentroidTot();

  // draw silhouette and thumb, each has different scale factor
  const factor = Math.sqrt(80000 / prob[prob.length - 2])
  this.bounds = prob[prob.length - 1]
  const thumbFactor = 0.95 * (this.thumbCanvasWH[0] / 2) / Math.max(...this.bounds.map(a => Math.abs(a)))
  // const thumbFactor = 0.8 * (this.thumbCanvasWH[0] / 2) / Math.max(...this.bounds.map(a => Math.abs(a)))

  // this.thumbCtx.fillStyle = 'yellow'
  // this.thumbCtx.fillRect(0, 0, ...this.thumbCanvasWH);
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
  this.thumbCtx.fillStyle = this.color1;
  this.thumbCtx.fill()
  this.octx.fillStyle = '#01FFFF';
  this.octx.fill()
}



TangramGame.prototype.reScaleShapes = function (factor) {
  for (let i = 0; i < this.shapes.length; i++) {
    const shape = this.shapes[i];
    shape.vertices = shape.vertices
      .map(ele => ele.map(e => e * factor));
    shape.centroid = shape.centroid
      .map(e => e * factor);
    shape.centroidOrig = shape.centroidOrig
      .map(e => e * factor);
    shape.area = shape.area * factor ** 2;
  }
}

TangramGame.prototype.rePositionShapes = function () {
  const maxXY = [0, 0];
  for (let i = 0; i < this.shapes.length; i++) {
    const shape = this.shapes[i];
    for (let j = 0; j < shape.vertices.length; j++) {
      maxXY[0] = Math.max(maxXY[0], shape.vertices[j][0]);
      maxXY[1] = Math.max(maxXY[1], shape.vertices[j][1]);
    }
  }

  const delta = this.canvasWH.map((ele, idx) => (
    ele - maxXY[idx]
  ))

  for (let i = 0; i < this.shapes.length; i++) {
    const shape = this.shapes[i];
    move(shape, delta);
  }
}

TangramGame.prototype.renderLoop = function () {


  // draw tiles on main canvas and silhouette
  // reapply silhouette
  this.silCtx.drawImage(this.ofc, 0, 0);
  this.ctx.fillStyle = this.backgroundcolor;
  this.ctx.fillRect(0, 0, ...this.canvasWH);





  this.silCtx.beginPath();
  this.ctx.fillStyle = this.pattern;
  for (let i = 0; i < this.shapes.length; i++) {
    const shape = this.shapes[i];

    this.ctx.beginPath();
    this.ctx.moveTo(
      ...shape.vertices[0]
    )
    this.silCtx.moveTo(
      ...shape.vertices[0].map((ele, idx) => (ele - this.centroidTot[idx]) * 100 / this.tL + this.silCanvWH[idx] / 2)
    )
    for (let j = 1; j < shape.vertices.length; j++) { // !!!! loop starts at 1, see above init point 
      this.ctx.lineTo(...shape.vertices[j])
      this.silCtx.lineTo(...shape.vertices[j].map(
        (ele, idx) => (ele - this.centroidTot[idx]) * 100 / this.tL + this.silCanvWH[idx] / 2
      )
      )
    }

    this.ctx.save()
    if (this.liftedPiece && i == this.shapes.length - 1) this.ctx.globalAlpha = 0.5;
    const trans = shape.centroid.map((ele, idx) => ele - shape.centroidOrig[idx])
    this.ctx.translate(...trans)
    this.ctx.translate(...shape.centroidOrig)
    this.ctx.rotate((shape.orientation - shape.orientationOrig) * Math.PI / 180)
    this.ctx.translate(...shape.centroidOrig.map(ele => -ele))
    this.ctx.fill()
    this.ctx.restore()

    // this.ctx.fillStyle = 'red';
    // this.ctx.fillRect(...shape.centroid,4,4)
  }

  this.silCtx.fillStyle = 'black'
  this.silCtx.fill()

  // dim shapes if menu active

  if (this.menuEle.style.display != 'none') {
    this.ctx.globalAlpha = .7;
    this.ctx.fillStyle = this.backgroundcolor;
    this.ctx.fillRect(0, 0, ...this.canvasWH);
    this.ctx.globalAlpha = 1;
  }

  // draw thumb
  if (
    this.menuEle.style.display != 'none'
    && (!this.times[this.probNum] || this.times[this.probNum][1] > 5000)
  ) {
    this.ctx.filter = `blur(14px)`
    this.ctx.drawImage(this.thumbCanvas, ...this.thumbLeftTopOffset);
    this.ctx.filter = `none`
  } else {
    this.ctx.drawImage(this.thumbCanvas, ...this.thumbLeftTopOffset);
  }

  // round corners
  // this.ctx.beginPath();
  // for (let i = 0; i < 4; i++) {
  //   this.ctx.moveTo(0, 0)
  //   this.ctx.lineTo(0, 15)
  //   this.ctx.arc(15, 15, 15, Math.PI, 3 * Math.PI / 2)
  //   this.ctx.closePath()
  //   this.ctx.translate(i % 2 == 0 ? this.canvas.width : this.canvas.height, 0)
  //   this.ctx.rotate(Math.PI / 2)
  // }
  // this.ctx.fillStyle = '#dddddd';
  // this.ctx.fill();


  // calc score
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

  // this.ctx.fillStyle = 'green';
  // this.ctx.fillRect(...this.centroidTot, 2, 2)
  // this.ctx.fillText(this.sum.toString(), 50, 550);
  // this.ctx.fillText(this.probNum.toString(), 50, 500);

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

TangramGame.prototype.updateCentroidTot = function (factor) {
  if (factor) {
    this.centroidTot = this.centroidTot
      .map(e => e * factor);
  } else {
    const totArea = this.shapes.reduce((acc, ele) => acc + ele.area, 0)
    this.centroidTot = this.shapes.reduce(
      (acc, ele) => acc.map(
        (e, idx) => e + ele.centroid[idx] * ele.area
      ),
      [0, 0]
    ).map(ele => ele / totArea)
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
    this.movingShapeIdx = i;

    // if (e.which != 3) { // left, middle, click
    if (e.button != 2) { // left, middle, click
      if (e.detail >= 2) { // double + click
        this.shapes.push(...this.shapes.splice(i, 1))
        this.liftedPiece = true;
        this.movingShapeIdx = this.shapes.length - 1;
      }
      document.addEventListener('mousemove', this.onShapeMove)
      document.addEventListener('mouseup', this.onShapeMoveEnd)
    } else { // right click
      if (e.detail == 2) { // double
        flipPoints(shape)
      }
      document.addEventListener('mousemove', this.onShapeRotate)
      document.addEventListener('mouseup', this.onShapeRotateEnd)
    }

    this.animating = true;
    requestAnimationFrame(this.renderLoop)
    break;
  }

}

TangramGame.prototype.onTouchCanvas = function (e) {
  e.preventDefault() // prevent touch cancel event from firing


  const coord = [
    e.touches[0].clientX - this.canvas.getBoundingClientRect().left,
    e.touches[0].clientY - this.canvas.getBoundingClientRect().top,
  ];

  for (let i = this.shapes.length - 1; i >= 0; i--) {
    const shape = this.shapes[i];
    if (!insidePoly(shape.vertices, coord)) continue;
    this.movingShapeIdx = i;

    // if (e.touches.length < 2) {
    this.prevTouch = [
      e.touches[0].clientX,
      e.touches[0].clientY
    ]
    document.addEventListener('touchmove', this.onShapeMove)
    document.addEventListener('touchend', this.onShapeMoveEnd)

    if (this.doubleTapId) { // double
      clearTimeout(this.doublTabId)

      document.removeEventListener('touchmove', this.onShapeMove)
      document.removeEventListener('touchend', this.onShapeMoveEnd)

      document.addEventListener('touchmove', this.onShapeRotate)
      document.addEventListener('touchend', this.onShapeRotateEnd)

      // flipPoints(shape)

      // rotate(shape, 45)

    } else {

      this.longpressId = setTimeout(
        () => {
          this.shapes.push(...this.shapes.splice(i, 1))
          this.liftedPiece = true;
          this.movingShapeIdx = this.shapes.length - 1;
        }
        , 400
      )

      this.doubleTapId = setTimeout(() => {
        this.doubleTapId = null
      }, 400
      )
    }

    this.animating = true;
    requestAnimationFrame(this.renderLoop)
    break;
  }

}




TangramGame.prototype.onShapeMoveEnd = function (e) {
  this.liftedPiece = false;
  this.updateCentroidTot()
  document.removeEventListener('mousemove', this.onShapeMove)
  document.removeEventListener('mouseup', this.onShapeMoveEnd)

  clearInterval(this.longpressId)
  document.removeEventListener('touchmove', this.onShapeMove)
  document.removeEventListener('touchend', this.onShapeMoveEnd)

  this.animating = false
}

TangramGame.prototype.onShapeRotateEnd = function (e) {

  snapTo45(this.shapes[this.movingShapeIdx])
  document.removeEventListener('mousemove', this.onShapeRotate)
  document.removeEventListener('mouseup', this.onShapeRotateEnd)

  document.removeEventListener('touchmove', this.onShapeRotate)
  document.removeEventListener('touchend', this.onShapeRotateEnd)
  this.animating = false
}

TangramGame.prototype.onShapeMove = function (e) {
  clearInterval(this.longpressId)
  if (!e.target.tagName) return;
  const shape = this.shapes[this.movingShapeIdx];
  let delta;
  if (e.touches) {
    delta = [
      e.touches[0].clientX - this.prevTouch[0],
      e.touches[0].clientY - this.prevTouch[1]
    ];
    this.prevTouch = [
      e.touches[0].clientX,
      e.touches[0].clientY
    ]
  } else {
    delta = [e.movementX, e.movementY];
  }
  move(shape, delta);
  if (!this.liftedPiece) {
    move(shape, this.checkCollisions(this.movingShapeIdx, delta));
  }
  this.saveBoard = true;
}

TangramGame.prototype.onShapeRotate = function (e) {
  const shape = this.shapes[this.movingShapeIdx]


  let start = [];
  let end = [];
  let angle, coord, prevCoord;
  if (e.touches) {

    coord = [
      e.touches[0].clientX - this.canvas.getBoundingClientRect().left,
      e.touches[0].clientY - this.canvas.getBoundingClientRect().top,
    ];

    prevCoord = [
      this.prevTouch[0] - this.canvas.getBoundingClientRect().left,
      this.prevTouch[1] - this.canvas.getBoundingClientRect().top
    ]

    this.prevTouch = [e.touches[0].clientX, e.touches[0].clientY];

  } else {
    coord = [
      e.clientX - this.canvas.getBoundingClientRect().left,
      e.clientY - this.canvas.getBoundingClientRect().top,
    ];
    prevCoord = [
      coord[0] - e.movementX,
      coord[1] - e.movementY
    ]

  }

  for (let idx = 0; idx < 2; idx++) {
    start[idx] = prevCoord[idx] - shape.centroid[idx];
    end[idx] = coord[idx] - shape.centroid[idx];
  }

  angle = Math.asin(
    cross(start, end) / Math.sqrt(
      (start[0] ** 2 + start[1] ** 2) *
      (end[0] ** 2 + end[1] ** 2)
    )
  ) / Math.PI * 180;

  rotate(shape, angle)
  this.saveBoard = true;
}

TangramGame.prototype.positionComps = function () {
  const selectorStyle = {};
  const topWrapStyle = {}

  const ls = this.levelSelector;
  selectorStyle.height = ls.svg_w;
  selectorStyle.width = ls.svg_h;

  const vThresh = 1800;
  const hThresh = 500;

  if (this.canvas.height > 554) { //portrait
    topWrapStyle.left = ((this.canvasWH[0] < hThresh ? this.canvasWH[0] : hThresh) - 300) / 2;
    topWrapStyle.top = ((this.canvasWH[1] < vThresh ? this.canvasWH[1] : vThresh) - (200 + 70 + 284)) / 3;

    console.log(this.canvasWH[1], topWrapStyle.top);
    selectorStyle.left = ((this.canvasWH[0] < hThresh ? this.canvasWH[0] : hThresh) - 360) / 2;
    selectorStyle.top = 200 + 70 + 2 * topWrapStyle.top;

  } else { //landscape
    topWrapStyle.left = ((this.canvasWH[0] < vThresh ? this.canvasWH[0] : vThresh) - (300 + 360)) / 3
    topWrapStyle.top = ((this.canvasWH[1] < hThresh ? this.canvasWH[1] : hThresh) - (200 + 70)) / 2;

    selectorStyle.left = 300 + 2 * topWrapStyle.left;
    selectorStyle.top = ((this.canvasWH[1] < hThresh ? this.canvasWH[1] : hThresh) - 284) / 2;

  }
  this.thumbLeftTopOffset[0] = topWrapStyle.left;
  this.thumbLeftTopOffset[1] = topWrapStyle.top;

  Object.keys(selectorStyle).forEach(key => { selectorStyle[key] += 'px' });
  Object.assign(this.levelSelector.wrapper.style, selectorStyle)

  Object.keys(topWrapStyle).forEach(key => { topWrapStyle[key] += 'px' });
  for (let ele of document.getElementsByClassName('topWrapper')) {
    Object.assign(ele.style, topWrapStyle);
  }


}