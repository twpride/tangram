

import { createSVGNode, setNode, setClassNodes } from './util.js'
import { Bezier } from './cubicBezier.js'

window.Bezier = Bezier

export function LevelSelector(game) {
  this.game = game;

  // const size = 30;
  const size = 50;
  const pitch = 75;
  // const nrow = 18;
  // const ncol = 10;
  const nrow = 36;
  const ncol = 5;

  this.svg_w = (ncol - 1) * pitch + size;
  this.svg_h = (nrow - 1) * pitch + size;

  this.pg = 0;
  // this.npg = 3;
  this.npg = 6;

  this.cardHeight = nrow / this.npg * pitch;
  // this.cardPitch = 350;
  console.log(this.cardHeight,'ch')
  this.cardPitch = this.cardHeight*1.7;
  this.cardOffset = (this.cardPitch - this.cardHeight) / 2;

  this.vbOrigin = 0;

  this.cardSlideStartTime = null;
  this.vbOriginStart = null;

  this.cardSlideLoop = this.cardSlideLoop.bind(this);
  // this.slideDir = 1;


  this.dragging = false;

  this.bezier = Bezier(0.4, 0.0, 0.2, 1);



  this.svgNode = setNode('levelSelector', {
    width: this.svg_w,
    height: this.cardPitch,
    viewBox: `0 ${this.vbOrigin} ${this.svg_w} ${this.cardPitch}`,
    preserveAspectRatio: 'xMinYMin slice',
    overflow: 'hidden'
  })

  Object.assign(document.getElementById('levelSelectorWrapper').style, {
    width: this.svg_w + 'px',
    height: this.cardPitch + 'px',
  });

  setClassNodes('cardArrow', {
    width: 40, height: 40, fill: this.game.color1
  })

  setNode('cardUpArrow', {
    fill: 'none'
  })

  document.getElementById('cardUpArrow').addEventListener('click', (e) => {
    if (this.pg > 0) {
      this.pg -= 1
      requestAnimationFrame(this.cardSlideLoop)
      setNode('cardUpArrow', {
        fill: this.pg == 0 ? 'none' : this.game.color1
      })
      setNode('cardDownArrow', {
        fill: this.pg == 2 ? 'none' : this.game.color1
      })
    }
  })
  document.getElementById('cardDownArrow').addEventListener('click', (e) => {
    if (this.pg < 2) {
      this.pg += 1
      requestAnimationFrame(this.cardSlideLoop)
      setNode('cardUpArrow', {
        fill: this.pg == 0 ? 'none' : this.game.color1
      })
      setNode('cardDownArrow', {
        fill: this.pg == 2 ? 'none' : this.game.color1
      })
    }
  })


  this.legendNode = setNode('legend', {
    width: 320,
    height: 160,
    viewBox: `0 0 320 160`,
    preserveAspectRatio: 'xMinYMin slice',
    overflow: 'hidden'
  })
  Object.assign(this.legendNode.style, {
    position: 'absolute',
    bottom: '350px',
    left: '40px',
    cursor: 'pointer',
    'z-index': '80'
  });

  this.game.progress = [0, 0, 0];

  for (let pg = 0; pg < this.npg; pg++) {
    for (let i = 0; i < nrow / this.npg; i++) {
      for (let j = 0; j < ncol; j++) {
        const idx = pg * nrow * ncol / this.npg + i * ncol + j;

        const [time, score] = this.game.times[idx] || [0, 7000];

        let color;
        const timeFraction = time / 300;

        if (score < 5000) {
          const colAngle = 120 - Math.floor((timeFraction > 1 ? 1 : timeFraction) * 120);
          color = `hsl(${colAngle}, 100%, 50%)`
          this.game.progress[2] += 1
        } else {
          if (time > 0) {
            const satPercent = Math.floor((timeFraction > 1 ? 1 : timeFraction) * 100);
            color = `hsl(240, ${satPercent}%, 73%)`
            this.game.progress[1] += 1
          } else {
            color = 'white';
            this.game.progress[0] += 1
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


  document.getElementById('solvedString').innerHTML = this.game.progress[2] + " solved";
  document.getElementById('inProgressString').innerHTML = this.game.progress[1] + " in progress";
  document.getElementById('notStartedString').innerHTML = this.game.progress[0] + " not started";




  this.svgNode.addEventListener('mouseover', (e) => {
    if (this.dragging || e.buttons != 0 || e.target.tagName == "svg") return;
    const coord = [
      e.clientX - this.svgNode.getBoundingClientRect().left,
      e.clientY - this.svgNode.getBoundingClientRect().top - this.cardOffset,
    ];
    const val = this.pg * nrow * ncol / this.npg + Math.floor(coord[1] / pitch) * ncol + Math.floor(coord[0] / pitch)
    this.game.loadProb(val)
    requestAnimationFrame(this.game.renderLoop)


    if (this.sum < 5000) {
      this.game.probState = 2;
    } else {
      if (this.timer.total_S > 0) {
        this.game.probState = 1;
      } else {
        this.game.probState = 0;
      }
    }

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
  if (this.dragging) {
    this.pg = Math.round(this.vbOrigin / this.cardPitch);
    requestAnimationFrame(this.cardSlideLoop)
    this.dragging = false;

    setNode('cardUpArrow', {
      fill: this.pg == 0 ? 'none' : this.game.color1
    })
    setNode('cardDownArrow', {
      fill: this.pg == 2 ? 'none' : this.game.color1
    })

  } else if (e.target.tagName != "svg") {
    this.game.menuEle.style.display = 'none';
    document.getElementById("pauseButton").style.display = 'block';
    requestAnimationFrame(this.game.renderLoop)
  }




  document.removeEventListener('mousemove', this.onMouseMove)
  document.removeEventListener('mouseup', this.onMouseUp)
}


LevelSelector.prototype.cardSlideLoop = function (timestamp) {
  if (!this.cardSlideStartTime) {
    this.cardSlideStartTime = timestamp;
    this.vbOriginStart = this.vbOrigin;
    this.delta = this.pg * this.cardPitch - this.vbOrigin;
  }
  const elapsed = timestamp - this.cardSlideStartTime;
  if (elapsed < 200) { // Stop the animation after 0.5 seconds
    const newVbOrigin = this.vbOriginStart + this.bezier(elapsed / 200) * this.delta;
    this.svgNode.setAttribute('viewBox', `0 ${newVbOrigin} ${this.svg_w} ${this.cardPitch}`)
    requestAnimationFrame(this.cardSlideLoop);
  } else {
    this.vbOrigin = this.vbOriginStart + this.delta;
    this.svgNode.setAttribute('viewBox', `0 ${this.vbOrigin} ${this.svg_w} ${this.cardPitch}`)
    this.cardSlideStartTime = null;
  }
}

LevelSelector.prototype.getColorVal = function (time = 0, score = 0) {

  let color;
  const timeFraction = time / 300;

  if (score < 5000) {
    const colAngle = 120 - Math.floor((timeFraction > 1 ? 1 : timeFraction) * 120);
    color = `hsl(${colAngle}, 100%, 50%)`
    this.progress[0] += 1
  } else {
    if (timeFraction > 0) {
      const satPercent = Math.floor((timeFraction > 1 ? 1 : timeFraction) * 100);
      color = `hsl(240, ${satPercent}%, 73%)`
      this.progress[1] += 1
    } else {
      color = 'white';
      this.progress[2] += 1
    }
  }

}