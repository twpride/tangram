import { move, rotate, snapTo45, flipPoints } from "./shape.js"
import { shapeGeoms } from "./shapeGeoms.js"
import { insidePoly, cross, calcPenetration } from "./vectorUtils.js"
import { problems } from './problemsData.js'
import { setNode, setClassNodes } from './util.js'
import { Timer } from './timer.js'

export function TangramGame() {

  this.animating = false
  this.backgroundcolor = '#cccccc'
  this.color1 = '#555'
  this.color2 = '#ad0f37'

  document.getElementById("canv").style.backgroundColor = this.backgroundcolor




  this.container = document.getElementById('canv');
  this.canvasWH = [this.container.clientWidth, this.container.clientHeight];
  this.canvas = document.getElementById('mainCanvas')
  this.canvas.oncontextmenu = () => false;
  this.canvas.width = this.canvasWH[0];
  this.canvas.height = this.canvasWH[1];
  this.ctx = this.canvas.getContext("2d");

  Object.assign(this.canvas.style, {
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
    margin: 'auto',
  });

  this.tL = this.canvasWH[1] / 8;
  this.shapeGeoms = shapeGeoms(this.tL)
  this.totArea = this.shapeGeoms.reduce((acc, ele) => acc + ele.area, 0);


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
  this.thumbCanvasWH = [2.5 * this.tL, 2.5 * this.tL];
  this.thumbCanvas = document.createElement('canvas')
  this.thumbCanvas.width = this.thumbCanvasWH[0];
  this.thumbCanvas.height = this.thumbCanvasWH[1];
  this.thumbCtx = this.thumbCanvas.getContext('2d');
  this.thumbLeftTopOffset = [40, 40];
  // this.thumbContainer.appendChild(this.thumbCanvas);




  this.liftedPiece = false;
  this.saveBoard = false;
  this.timer = new Timer(document.getElementById('timer'));


  let times;
  if (times = localStorage.getItem('times')) {
    this.times = JSON.parse(times);
  } else {
    this.times = []
  }


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

  document.getElementById("pauseButton").style.display = 'none'

  document.getElementById("pauseButton").addEventListener('click', (e) => {
    this.stopTimerSaveProgress()
    this.menuEle.style.display = 'block';
    document.getElementById("pauseButton").style.display = 'none'
    requestAnimationFrame(this.renderLoop)
  })

  document.getElementById('playButton').addEventListener('click', () => {
    this.menuEle.style.display = 'none';
    document.getElementById("pauseButton").style.display = 'block'
    requestAnimationFrame(this.renderLoop)
  })


  document.addEventListener('keydown', (e) => {
    if (e.key != 'Escape') return;
    if (this.menuEle.style.display != 'none') {
      this.menuEle.style.display = 'none';
      document.getElementById("pauseButton").style.display = 'block'
    } else {
      this.stopTimerSaveProgress()
      this.menuEle.style.display = 'block';
      document.getElementById("pauseButton").style.display = 'none'
    }
    requestAnimationFrame(this.renderLoop)
  })


  setClassNodes('playpause', {
    width: 50, height: 50, fill: this.color2
  })

  setNode('flipButton', {
    width: 70, height: 70, fill: this.color2
  })

}


TangramGame.prototype.stopTimerSaveProgress = function () {
  this.timer.stop()
  if (this.saveBoard) {
    localStorage.setItem(this.probNum, JSON.stringify(this.shapes))
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

  document.getElementById('levelSelector').childNodes[this.probNum * 2].setAttribute('fill', color);

  document.getElementById('solvedString').innerHTML = this.progress[2] + " solved";
  document.getElementById('inProgressString').innerHTML = this.progress[1] + " in progress";
  document.getElementById('notStartedString').innerHTML = this.progress[0] + " not started";

}


TangramGame.prototype.resetBoard = function () {
  localStorage.removeItem(this.probNum);
  this.shapes = JSON.parse(JSON.stringify(this.shapeGeoms))
  this.updateCentroidTot();
  this.saveBoard = false;
}

TangramGame.prototype.loadProb = function (probNum) {
  // load problem data, if not valid problem return early
  let prob;
  if (!(prob = problems[probNum])) return;

  this.probNum = probNum;

  document.getElementById('probnum').innerHTML = "#" + (probNum + 1);

  this.timer.reset(
    (this.times[this.probNum] && this.times[this.probNum][0]) || 0
  )

  // set tile positions, load from local storage if it was saved if not load default
  this.saveBoard = false;
  let shapeString;
  if (shapeString = localStorage.getItem(probNum)) {
    this.shapes = JSON.parse(shapeString)
  } else {
    this.shapes = JSON.parse(JSON.stringify(this.shapeGeoms))
  }
  this.updateCentroidTot();

  // draw silhouette and thumb, each has different scale factor
  const factor = Math.sqrt(this.totArea / prob[prob.length - 2])
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
  this.thumbCtx.fillStyle = this.color1;
  this.thumbCtx.fill()
  this.octx.fillStyle = '#01FFFF';
  this.octx.fill()
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
      ...shape.vertices[0].map((ele, idx) => ele - this.centroidTot[idx] + this.silCanvWH[idx] / 2)
    )
    for (let j = 1; j < shape.vertices.length; j++) {
      this.ctx.lineTo(...shape.vertices[j])
      this.silCtx.lineTo(...shape.vertices[j].map(
        (ele, idx) => ele - this.centroidTot[idx] + this.silCanvWH[idx] / 2
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
  this.ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    this.ctx.moveTo(0, 0)
    this.ctx.lineTo(0, 15)
    this.ctx.arc(15, 15, 15, Math.PI, 3 * Math.PI / 2)
    this.ctx.closePath()
    this.ctx.translate(i % 2 == 0 ? this.canvas.width : this.canvas.height, 0)
    this.ctx.rotate(Math.PI / 2)
  }
  this.ctx.fillStyle = '#dddddd';
  this.ctx.fill();


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

  this.ctx.fillStyle = 'green';
  // this.ctx.fillRect(...this.centroidTot, 2, 2)
  this.ctx.fillText(this.sum.toString(), 50, 550);
  this.ctx.fillText(this.probNum.toString(), 50, 500);

  if (this.animating) {
    requestAnimationFrame(this.renderLoop);
  }


  this.canvas.addEventListener('touchcancel', (e) => {

    console.log('cancelled')

  })



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
      clearInterval(this.longpressId)
      document.removeEventListener('touchmove', this.onShapeMove)
      document.removeEventListener('touchend', this.onShapeMoveEnd)

      document.addEventListener('touchmove', this.onShapeRotate)
      document.addEventListener('touchend', this.onShapeRotateEnd)
      // flipPoints(shape)

      this.prevCoord
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
  // this.liftedPiece = false;
  this.animating = false
}

TangramGame.prototype.onShapeMove = function (e) {
  clearInterval(this.longpressId)
  if (e.target.tagName == 'HTML') return;
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
