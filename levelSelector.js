

import { createSVGNode, setNode } from './util.js'
import { Bezier } from './cubicBezier.js'

window.Bezier = Bezier

export function LevelSelector(game) {
  this.game = game;

  const size = 30;
  const pitch = 36;
  const nrow = 18;
  const ncol = 10;

  this.svg_w = (ncol - 1) * pitch + size;
  this.svg_h = (nrow - 1) * pitch + size;

  this.pg = 0;
  this.npg = 3;

  this.cardHeight = nrow / this.npg * pitch;
  this.cardPitch = 350;
  this.cardOffset = (this.cardPitch - this.cardHeight) / 2;

  this.vbOrigin = 0;

  this.dragging = false;

  this.bezier = Bezier(0.4, 0.0, 0.2, 1);

  this.svgNode = setNode('levelSelector', {
    width: this.svg_w,
    height: this.cardPitch,
    viewBox: `0 ${this.vbOrigin} ${this.svg_w} ${this.cardPitch}`,
    preserveAspectRatio: 'xMinYMin slice',
    overflow: 'hidden'
  })


  Object.assign(this.svgNode.style, {
    position: 'absolute',
    bottom: '0px',
    left: '40px',
    cursor: 'pointer',
  });


  this.legendNode = setNode('legend', {
    width: 240,
    height: 40,
    viewBox: `0 0 240 40`,
    preserveAspectRatio: 'xMinYMin slice',
    overflow: 'hidden'
  })


  Object.assign(this.legendNode.style, {
    position: 'absolute',
    bottom: '350px',
    left: '40px',
    cursor: 'pointer',
  });



  for (let pg = 0; pg < this.npg; pg++) {
    for (let j = 0; j < ncol; j++) {
      for (let i = 0; i < nrow / this.npg; i++) {

        const idx = pg * nrow * ncol / this.npg + i * ncol + j;

        const [time, score] = this.game.times[idx] || [0, 0];

        let color;

        const timeFraction = time / 300;

        if (score < 5000) {
          const colAngle = 120 - Math.floor((timeFraction > 1 ? 1 : timeFraction) * 120);
          color = `hsl(${colAngle}, 100%, 50%)`
        } else {
          if (timeFraction > 0) {

            const satPercent_pre = Math.floor((timeFraction > 1 ? 1 : timeFraction) * 100);
            // const satPercent = timeFraction>0? (10 + satPercent_pre*.9) : 0;
            // const lightPercent = 73 - .1*satPercent_pre; 
            // console.log(lightPercent)
            color = `hsl(240, ${satPercent_pre}%, 73%)`
            // color = `hsl(240, ${satPercent}%, ${lightPercent}%)`
          } else {
            color = 'white';
          }
        }

        const rect = createSVGNode('rect', {
          x: j * pitch,
          y: i * pitch + pg * this.cardPitch + this.cardOffset,
          height: size,
          width: size,
          rx: 10,
          fill: color,
        });
        this.svgNode.appendChild(rect);


        const text = createSVGNode('text',
          {
            x: j * pitch + size / 2,
            y: i * pitch + size / 2 + pg * this.cardPitch + this.cardOffset,
            "font-size": 10,
            // fill: '#777777',
            fill: 'black',
            "font-family": 'sans-serif',
            'dominant-baseline': 'central',
            'text-anchor': 'middle',
          });
        text.innerHTML = idx + 1;
        this.svgNode.appendChild(text);
      }
    }
  }
  
  this.cardSlideLoop = this.cardSlideLoop.bind(this);
  this.slideDir = 1;


  this.svgNode.addEventListener('mouseenter', (e) => {
    this.game.previewAnimating = true;
  })

  this.svgNode.addEventListener('mouseleave', (e) => {
    this.game.fadeAlpha = 0;
    this.game.previewAnimating = false;
  })

  this.svgNode.addEventListener('mouseover', (e) => {
    if (this.dragging || e.buttons != 0 || e.target.tagName == "svg") return;
    const coord = [
      e.clientX - this.svgNode.getBoundingClientRect().left,
      e.clientY - this.svgNode.getBoundingClientRect().top - this.cardOffset,
    ];
    const val = this.pg * nrow * ncol / this.npg + Math.floor(coord[1] / pitch) * ncol + Math.floor(coord[0] / pitch)
    this.game.loadProb(val)
    this.game.previewLoop()
    this.game.renderLoop()
  })


  this.svgNode.addEventListener('mousedown', (e) => {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  })

  this.onMouseMove = this.onMouseMove.bind(this);
  this.onMouseUp = this.onMouseUp.bind(this);
}

LevelSelector.prototype.onMouseMove = function (e) {
  this.dragging = true;
  this.vbOrigin -= e.movementY

  if (this.vbOrigin < -this.cardPitch * 0.05) {
    this.vbOrigin = -this.cardPitch * 0.05;
  } else if (this.vbOrigin > (this.npg - 1) * this.cardPitch + this.cardPitch * 0.05) {
    this.vbOrigin = (this.npg - 1) * this.cardPitch + this.cardPitch * 0.05;
  }
  this.svgNode.setAttribute('viewBox', `0 ${this.vbOrigin} ${this.svg_w} ${this.cardPitch}`)
}

LevelSelector.prototype.onMouseUp = function (e) {
  this.pg = Math.round(this.vbOrigin / this.cardPitch);
  this.vbOrigin = this.pg * this.cardPitch;
  this.svgNode.setAttribute('viewBox', `0 ${this.vbOrigin} ${this.svg_w} ${this.cardPitch}`)

  if (!this.dragging && e.target.tagName != "svg") {
    this.game.menuEle.style.display = 'none';
    this.game.timer.start()
    if (this.game.sum > 5000) {
      this.game.timer.start()
    }
  }

  this.dragging = false;

  document.removeEventListener('mousemove', this.onMouseMove)
  document.removeEventListener('mouseup', this.onMouseUp)
}


LevelSelector.prototype.cardSlideLoop = function (timestamp) {
  if (this.start === undefined) this.start = timestamp;
  const elapsed = timestamp - this.start;
  if (elapsed < 500) { // Stop the animation after 0.5 seconds
    const newVbOrigin = this.vbOrigin + this.bezier(elapsed / 500) * this.cardPitch;
    this.svgNode.setAttribute('viewBox', `0 ${newVbOrigin} ${this.svg_w} ${this.cardPitch}`)
    window.requestAnimationFrame(this.cardSlideLoop);
  } else {
    const newVbOrigin = this.vbOrigin + this.cardPitch;
    this.svgNode.setAttribute('viewBox', `0 ${newVbOrigin} ${this.svg_w} ${this.cardPitch}`)
  }
}