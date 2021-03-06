

import { createSVGNode, setNode, setClassNodes } from './util.js'
import { Bezier } from './cubicBezier.js'


// export function LevelSelector(game, size) {
export class LevelSelector {

  pg = 0;
  vbMinX = 0;
  bezier = Bezier(0.4, 0.0, 0.2, 1);
  cardSlideStartTime = null;
  vbMinXStart = null;
  dragging = false;

  nrow = 40;
  ncol = 5;
  npg = 8;

  w_padding = 2;

  wrapper = document.getElementById('levelSelectorWrapper');

  cardSlideLoop = this.cardSlideLoop.bind(this);
  onMouseMove = this.onMouseMove.bind(this);
  onMouseUp = this.onMouseUp.bind(this);
  onTouchEnd = this.onTouchEnd.bind(this);

  constructor(game, size) {
    this.game = game;
    this.pitch = 1.5 * size;

    this.createSelectorSvg(size)

    setNode('cardUpArrow', {
      fill: this.pg == 0 ? 'none' : this.game.color1
    })

    document.getElementById('solvedString').children[2].textContent = this.game.progress[2].toString().padStart(3)
    document.getElementById('inProgressString').children[2].textContent = this.game.progress[1].toString().padStart(3)
    document.getElementById('notStartedString').children[2].textContent = this.game.progress[0].toString().padStart(3)
    
    document.getElementById('cardUpArrow').addEventListener('click', (e) => {
      if (this.pg > 0) {
        this.pg -= 1
        requestAnimationFrame(this.cardSlideLoop)
        setNode('cardUpArrow', {
          fill: this.pg == 0 ? 'none' : this.game.color1
        })
        setNode('cardDownArrow', {
          fill: this.pg == this.npg - 1 ? 'none' : this.game.color1
        })
      }
    })

    document.getElementById('cardDownArrow').addEventListener('click', (e) => {
      if (this.pg < this.npg - 1) {
        this.pg += 1
        requestAnimationFrame(this.cardSlideLoop)
        setNode('cardUpArrow', {
          fill: this.pg == 0 ? 'none' : this.game.color1
        })
        setNode('cardDownArrow', {
          fill: this.pg == this.npg - 1 ? 'none' : this.game.color1
        })
      }
    })

    document.getElementById('cardDownArrow').addEventListener('touchstart', (e) => {
      // prevent wrapper touchstart listener from intercepting event
      e.stopPropagation()
    })
    document.getElementById('cardUpArrow').addEventListener('touchstart', (e) => {
      // prevent wrapper touchstart listener from intercepting event
      e.stopPropagation()
    })

    this.wrapper.addEventListener('mouseover', (e) => {
      if (this.dragging || e.buttons != 0 || e.target.tagName == "svg") return;
      const coord = [
        e.clientX - this.selectorSvg.getBoundingClientRect().left - this.h_padding,
        e.clientY - this.selectorSvg.getBoundingClientRect().top,
      ];
      const val = this.pg * this.nrow * this.ncol / this.npg + Math.floor(coord[1] / this.pitch) * this.nrow / this.npg + Math.floor(coord[0] / this.pitch)
      this.game.loadProb(val)

      this.game.renderLoop() // we don't call requestAnimationFram because we need fcn side effect immediately

      if (this.game.sum < this.game.criteria) {
        this.game.probState = 2;
      } else {
        if (this.game.timer.total_S > 0) {
          this.game.probState = 1;
        } else {
          this.game.probState = 0;
        }
      }
    })

    this.wrapper.addEventListener('mousedown', (e) => {
      document.addEventListener('mousemove', this.onMouseMove)
      document.addEventListener('mouseup', this.onMouseUp)
    })

    this.wrapper.addEventListener('touchstart', (e) => {
      // touch and mouse behavior diverge
      // preventdefault in touchend to prevent mouse events from firing 
      this.prevTouch = [
        e.touches[0].clientX,
        e.touches[0].clientY
      ]

      document.addEventListener('touchmove', this.onMouseMove)
      document.addEventListener('touchend', this.onTouchEnd)

      if (e.target.tagName == "svg") return;
      const coord = [
        e.touches[0].clientX - this.selectorSvg.getBoundingClientRect().left - this.h_padding,
        e.touches[0].clientY - this.selectorSvg.getBoundingClientRect().top,
      ];
      const val = this.pg * this.nrow * this.ncol / this.npg + Math.floor(coord[1] / this.pitch) * this.nrow / this.npg + Math.floor(coord[0] / this.pitch)

      if (val == this.game.probNum) {
        this.game.menuEle.style.display = 'none';
        for (let ele of document.getElementsByClassName('canvButton')) {
          Object.assign(ele.style, { display: 'block' });
        }
        requestAnimationFrame(this.game.renderLoop)
      } else {

        const nodeToClear = this.selectorSvg.childNodes[this.game.probNum * 2]
        nodeToClear.removeAttribute('stroke')
        nodeToClear.removeAttribute("stroke-width")

        this.game.loadProb(val)

        const nodeToHigh = this.selectorSvg.childNodes[this.game.probNum * 2]
        nodeToHigh.setAttribute("stroke", 'black');
        nodeToHigh.setAttribute("stroke-width", '2');

        requestAnimationFrame(this.game.renderLoop)
        if (this.sum < this.game.criteria) {
          this.game.probState = 2;
        } else {
          if (this.game.timer.total_S > 0) {
            this.game.probState = 1;
          } else {
            this.game.probState = 0;
          }
        }
      }

    })

    this.wrapper.addEventListener('contextmenu', (e) => e.preventDefault())

  }
}

LevelSelector.prototype.createSelectorSvg = function (size) {
  setClassNodes('cardArrow', {
    width: size * .8, height: size * .8, fill: this.game.color1
  })


  this.svg_w = (this.ncol - 1) * this.pitch + size + this.w_padding * 2;

  this.h_padding = size;
  this.svg_h = (this.nrow / this.npg - 1) * this.pitch + size + this.h_padding * 2;

  this.vbMinX = this.pg * this.svg_h;

  const selectorSvg = createSVGNode('svg', {
    height: this.svg_w,
    width: this.svg_h,
    viewBox: `${this.vbMinX} 0  ${this.svg_h} ${this.svg_w}`,
    preserveAspectRatio: 'xMinYMin slice',
    overflow: 'hidden'
  })
  
  Object.assign(selectorSvg.style, {
    position: 'absolute',
  });
  this.game.progress = [0, 0, 0];

  for (let pg = 0; pg < this.npg; pg++) {
    for (let j = 0; j < this.ncol; j++) {
      for (let i = 0; i < this.nrow / this.npg; i++) {
        const idx = pg * this.nrow * this.ncol / this.npg + j * this.nrow / this.npg + i;

        if (idx == 179) {
          if (this.selectorSvg) {
            this.wrapper.replaceChild(selectorSvg, this.selectorSvg)
          } else {
            this.wrapper.append(selectorSvg)
          }
          this.selectorSvg = selectorSvg
          return;
        };
        const [time, score] = this.game.times[idx] || [0, 7000];

        let color;
        const timeFraction = time / 300;

        if (score < this.game.criteria) {
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
          y: j * this.pitch + this.w_padding,
          x: i * this.pitch + pg * this.svg_h + this.h_padding,
          height: size,
          width: size,
          rx: 10,
          fill: color,
        });
        selectorSvg.appendChild(rect);


        const text = createSVGNode('text',
          {
            y: j * this.pitch + size / 2 + this.w_padding,
            x: i * this.pitch + size / 2 + pg * this.svg_h + this.h_padding,
            "font-size": 10,
            // fill: '#777777',
            fill: 'black',
            "font-family": 'sans-serif',
            'dominant-baseline': 'central',
            'text-anchor': 'middle',
          });
        text.innerHTML = idx + 1;
        selectorSvg.appendChild(text);
      }
    }
  }

}

LevelSelector.prototype.onMouseMove = function (e) {
  this.dragging = true;

  if (e.touches) {
    this.vbMinX -= e.touches[0].clientX - this.prevTouch[0];
    this.prevTouch = [
      e.touches[0].clientX,
      e.touches[0].clientY
    ];

  } else {
    this.vbMinX -= e.movementX;
  }

  if (this.vbMinX < -this.svg_h * 0.05) {
    this.vbMinX = -this.svg_h * 0.05;
  } else if (this.vbMinX > (this.npg - 1) * this.svg_h + this.svg_h * 0.05) {
    this.vbMinX = (this.npg - 1) * this.svg_h + this.svg_h * 0.05;
  }
  this.selectorSvg.setAttribute('viewBox', `${this.vbMinX} 0 ${this.svg_h} ${this.svg_w}`)
}

LevelSelector.prototype.onMouseUp = function (e) {
  if (this.dragging) {
    this.pg = Math.round(this.vbMinX / this.svg_h);
    requestAnimationFrame(this.cardSlideLoop)
    this.dragging = false;

    setNode('cardUpArrow', {
      fill: this.pg == 0 ? 'none' : this.game.color1
    })
    setNode('cardDownArrow', {
      fill: this.pg == this.npg - 1 ? 'none' : this.game.color1
    })

  } else if (e.target.tagName != "svg" && e.target.tagName != "path") {

    this.game.menuEle.style.display = 'none';
    for (let ele of document.getElementsByClassName('canvButton')) {
      Object.assign(ele.style, { display: 'block' });
    }

    requestAnimationFrame(this.game.renderLoop)
  }


  document.removeEventListener('mousemove', this.onMouseMove)
  document.removeEventListener('mouseup', this.onMouseUp)
}

LevelSelector.prototype.onTouchEnd = function (e) {
  e.preventDefault() // prevent "mouse" chain of events from firing

  if (this.dragging) {
    this.pg = Math.round(this.vbMinX / this.svg_h);
    requestAnimationFrame(this.cardSlideLoop)
    this.dragging = false;

    setNode('cardUpArrow', {
      fill: this.pg == 0 ? 'none' : this.game.color1
    })
    setNode('cardDownArrow', {
      fill: this.pg == this.npg - 1 ? 'none' : this.game.color1
    })
  }

  document.removeEventListener('touchmove', this.onMouseMove)
  document.removeEventListener('touchend', this.onTouchEnd)
}

LevelSelector.prototype.cardSlideLoop = function (timestamp) {
  if (!this.cardSlideStartTime) {  // in first requestAnimationFrame call
    this.cardSlideStartTime = timestamp; // save starting timestamp of animation
    this.vbMinXStart = this.vbMinX; // save starting min-x of viewBox
    this.delta = this.pg * this.svg_h - this.vbMinX; // relative distance to final x-position of viewBox
  }
  const elapsed = timestamp - this.cardSlideStartTime;
  if (elapsed < 200) { // when animation is stil running
    const newvbMinX = this.vbMinXStart + this.bezier(elapsed / 200) * this.delta;
    this.selectorSvg.setAttribute('viewBox', `${newvbMinX} 0 ${this.svg_h} ${this.svg_w}`)
    requestAnimationFrame(this.cardSlideLoop);
  } else {  // when animation completes
    this.vbMinX = this.vbMinXStart + this.delta;
    this.selectorSvg.setAttribute('viewBox', `${this.vbMinX} 0 ${this.svg_h} ${this.svg_w}`)
    this.cardSlideStartTime = null;
  }
}

LevelSelector.prototype.getColorVal = function (time = 0, score = 0) {

  let color;
  const timeFraction = time / 300;

  if (score < this.game.criteria) {  // if the puzzle was solved
    const colAngle = 120 - Math.floor((timeFraction > 1 ? 1 : timeFraction) * 120);
    color = `hsl(${colAngle}, 100%, 50%)`
    this.progress[0] += 1
    console.log('here')
  } else {
    if (timeFraction > 0) { // puzzle unsolved but attempted
      const satPercent = Math.floor((timeFraction > 1 ? 1 : timeFraction) * 100);
      color = `hsl(240, ${satPercent}%, 73%)`
      this.progress[1] += 1
    } else { // unattempted puzzle
      color = 'white';
      this.progress[2] += 1
    }
  }

}


