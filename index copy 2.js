

function PoolGame() {
  this.container = document.getElementById('canv');
  this.canvas = document.createElement('canvas');
  this.canvas.width = this.container.clientWidth;
  this.canvas.height = this.container.clientHeight;
  this.xyMax = [this.canvas.width, this.canvas.height];
  this.ctx = this.canvas.getContext("2d");
  this.container.appendChild(this.canvas);
  this.rect = this.canvas.getBoundingClientRect();
  this.mass = 1;
  this.vl = 40;


  this.paused = false;

  this.pos = [[50, this.xyMax[1] - this.rad - 370]];
  this.vel = [[0, 0.5]];

  this.rad = 20; //pixels
  this.ratio = 2 * this.rad / 0.24;  // ~166.6 px / meter

  this.acc = [0, this.ratio * 9.8 / 1000];
  this.rest = 0.8;

  this.mouseDownPosTime = [];
  this.mouseVel = [0, 0];

  document.addEventListener('keydown', (e) => {
  })

  this.canvas.addEventListener('mousedown', (e) => {
    this.paused = true;
    this.pos = [[50, this.xyMax[1] - this.rad - 370]];
    this.vel = [[0, 0]];
    // const cur = [
    //   e.clientX - this.rect.left,
    //   e.clientY - this.rect.top,
    //   e.timeStamp
    // ]
    this.mouseDownPosTime = [];
    this.xxx = mouseMoveFcn.bind(this);
    this.canvas.addEventListener('mousemove', this.xxx)
  })

  this.canvas.addEventListener('mouseup', (e) => {

    const delxyt = [];
    console.log(this.mouseDownPosTime)
    let i = this.mouseDownPosTime.length - 4 < 0 ? 1 : this.mouseDownPosTime.length - 3;
    for (; i < this.mouseDownPosTime.length; i++) {
      const temp = [];
      for (let j = 0; j < 3; j++) {
        temp[j] = this.mouseDownPosTime[i][j] - this.mouseDownPosTime[i - 1][j];
      }
      delxyt.push(temp)
    }
    const res = delxyt.reduce((acc, cur) => {
      const ret2 = acc.map((accEle, idx) => {
        const adj = (1 - Math.abs(accEle) / this.vl);
        const ret = accEle + cur[idx] * (adj > 0 ? adj : 0) / this.mass;
        // const ret = accEle + cur[idx] * (1 / (Math.abs(accEle) + 1)) / this.mass;
        return ret;
      })
      console.log(ret2, 'ret2')
      return ret2;
    }, [0, 0])
    res.forEach((ele, idx) => {
      this.vel[0][idx] += ele;
    })
    console.log(delxyt, res)
    // console.log(Math.atan2(-delxyt[1],delxyt[0])/Math.PI*180)
    // console.log(Math.sqrt(delxyt[1] ** 2 + delxyt[0] ** 2) / delxyt[2])


    this.canvas.removeEventListener('mousemove', this.xxx)
    this.paused = false;
  })
}

function mouseMoveFcn(e) {

  this.mouseDownPosTime.push(
    [
      e.clientX - this.rect.left,
      e.clientY - this.rect.top,
      e.timeStamp
    ]
  )
}

PoolGame.prototype.gameLoop = function () {
  // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.fillStyle = "lightgrey";
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);


  // this.ctx.moveTo(x, this.midline - (this.dataArray[i] >>> 3));
  // this.ctx.lineTo(x, this.midline + (this.dataArray2[i] >>> 3));


  this.ctx.beginPath();
  for (let i = 0; i < this.pos.length; i++) {

    for (let j = 0; j < 2; j++) {
      if (!this.paused) {
        if (this.pos[i][j] - this.rad <= 0) {
          this.vel[i][j] = - this.vel[i][j] * this.rest;
          this.pos[i][j] = this.rad;
        } else if (this.pos[i][j] + this.rad >= this.xyMax[j]
        ) {
          this.vel[i][j] = - this.vel[i][j] * this.rest;
          this.pos[i][j] = this.xyMax[j] - this.rad;
        }
        this.vel[i][j] += this.acc[j];
        this.pos[i][j] += this.vel[i][j];
      }
    }
    this.ctx.arc(...this.pos[i], this.rad, 0, 2 * Math.PI);
  }


  this.ctx.fillStyle = "red";
  this.mouseDownPosTime.forEach((ele, idx) => {
    if (idx === 0) {
      this.ctx.moveTo(ele[0], ele[1])
    } else {
      this.ctx.lineTo(ele[0], ele[1])
    }
    this.ctx.fillRect(ele[0] - 2, ele[1] - 2, 4, 4);
  })

  this.ctx.fillRect(this.xyMax[0] - 25, this.xyMax[1] - 500, 25, 2);
  this.ctx.fillRect(this.xyMax[0] - 100, this.xyMax[1] - 500, 2, 2);
  this.ctx.stroke()


  this.ctx.font = "30px Arial";
  this.ctx.fillText(this.vel[0][1], 10, 50);
  this.ctx.fillText(this.pos[0][1] + this.rad, 10, 80);
  requestAnimationFrame(this.gameLoop.bind(this));
}

let game = new PoolGame();
window.game = game;
game.gameLoop()
