

function getNode(n, v) {
  n = document.createElementNS("http://www.w3.org/2000/svg", n);
  for (var p in v) n.setAttributeNS(null, p, v[p]);
  return n
}
function getEle(n, v) {
  n = document.createElement(n);
  for (var p in v) n.setAttributeNS(null, p, v[p]);
  return n
}

export function LevelSelector(game) {
  this.game = game;
  const size = 30;
  const pitch = 36;
  // const nrow = 10;
  // const ncol = 18;
  const nrow = 18;
  const ncol = 10;

  this.svg_w = (ncol - 1) * pitch + size;
  this.svg_h = (nrow - 1) * pitch + size;

  const targetDiv = document.getElementById('menu');

  this.pg = 0;
  this.npg = 3;
  this.cardHeight = nrow / this.npg * pitch;
  this.cardPitch = this.cardHeight * 1.7;

  const vw = this.svg_w;
  this.cardOffset = (this.cardPitch - this.cardHeight) / 2;
  this.y = 0;
  
  this.dragging = false;

  this.svgNode = getNode('svg', {
    width: vw,
    height: this.cardPitch,
    // viewBox: `0 ${this.cardPitch} ${vw} ${this.cardPitch}`,
    viewBox: `0 ${this.y} ${vw} ${this.cardPitch}`,
    preserveAspectRatio: 'xMinYMin slice',
    overflow: 'hidden'
  })

  Object.assign(this.svgNode.style, {
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    'z-index': '30',
    cursor: 'pointer',
    // 'pointer-events': 'none'
  });

  targetDiv.appendChild(this.svgNode);



  for (let pg = 0; pg < this.npg; pg++) {
    for (let j = 0; j < ncol; j++) {
      for (let i = 0; i < nrow / this.npg; i++) {

        const idx = pg * nrow * ncol / this.npg + i * ncol + j;
        // const idx = j * nrow + i;
        const [time, score] = this.game.times[idx] || [0, 0];

        let color;

        const timeFraction = time / 300;

        // if (time > 0 ) {
        if (score < 5000) {
          const colAngle = 120 - Math.floor((timeFraction > 1 ? 1 : timeFraction) * 120);
          color = `hsl(${colAngle}, 100%, 50%)`
        } else {
          const satPercent = Math.floor((timeFraction > 1 ? 1 : timeFraction) * 100);
          color = `hsl(240, ${satPercent}%, 73%)`
        }

        // const colAngle = (time > 1 ? 1 : time) * 240;
        // console.log(colAngle)
        const rect = getNode('rect', {
          x: j * pitch,
          y: i * pitch + pg * this.cardPitch + this.cardOffset,
          height: size,
          width: size,
          rx: 10,
          fill: color,
        });
        this.svgNode.appendChild(rect);


        const text = getNode('text',
          {
            x: j * pitch + size / 2,
            y: i * pitch + size / 2 + pg * this.cardPitch + this.cardOffset,
            "font-size": 10,
            fill: '#777777',
            "font-family": 'sans-serif',
            'dominant-baseline': 'central',
            'text-anchor': 'middle',
          });
        text.innerHTML = idx + 1;
        this.svgNode.appendChild(text);
      }
    }
  }


  this.svgNode.addEventListener('mouseenter', (e) => {
    this.game.previewAnimating = true;
  })

  this.svgNode.addEventListener('mouseleave', (e) => {
    this.game.fadeAlpha = 0;
    this.game.previewAnimating = false;
  })

  this.svgNode.addEventListener('mouseover', (e) => {
    if (this.dragging || e.buttons!=0 || e.target.tagName == "svg") return;
    const coord = [
      e.clientX - this.svgNode.getBoundingClientRect().left,
      e.clientY - this.svgNode.getBoundingClientRect().top - this.cardOffset,
    ];

    const val = this.pg * nrow * ncol / this.npg + Math.floor(coord[1] / pitch) * ncol + Math.floor(coord[0] / pitch)
    this.game.loadProb(val)
    this.game.fadeAlpha = 1;
    this.game.previewAnimating = true;
    this.game.previewLoop()
  })


  this.svgNode.addEventListener('mousedown', (e) => {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  })

  // this.onMouseDown = this.onMouseDown.bind(this);
  this.onMouseMove = this.onMouseMove.bind(this);
  this.onMouseUp = this.onMouseUp.bind(this);
}

LevelSelector.prototype.onMouseMove = function (e) {
  this.dragging = true;
  this.y -= e.movementY

  if (this.y < -this.cardPitch*0.05) {
    this.y = -this.cardPitch*0.05;
  } else if (this.y > (this.npg-1)*this.cardPitch +this.cardPitch*0.05) {
    this.y = (this.npg-1)*this.cardPitch+this.cardPitch*0.05; 
  }
  this.svgNode.setAttribute('viewBox', `0 ${this.y} ${this.svg_w} ${this.cardPitch}`)
}

LevelSelector.prototype.onMouseUp = function (e) {
  this.pg = Math.round(this.y / this.cardPitch);
  this.y = this.pg * this.cardPitch;
  this.svgNode.setAttribute('viewBox', `0 ${this.y} ${this.svg_w} ${this.cardPitch}`)

  if (!this.dragging && e.target.tagName != "svg") {
    this.game.enterGame()
  }
  
  this.dragging = false;

  document.removeEventListener('mousemove', this.onMouseMove)
  document.removeEventListener('mouseup', this.onMouseUp)
}




