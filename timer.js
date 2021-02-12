export function Timer(dispEle) {
  this.initial_S = 0;
  this.elapsed_S = 0;
  this.total_S = 0;
  this.dispEle = dispEle;
  this.dispEle.innerHTML = this.convertSecsToMins(this.elapsed_S+this.initial_S);
  this.intervalId = null;
}


Timer.prototype.start = function () {
  if (this.intervalId) return;
  this.intervalId = setInterval(
    () => {
      if (document.visibilityState == 'hidden') return;
      this.elapsed_S += 1;
      this.total_S = this.initial_S + this.elapsed_S
      this.dispEle.innerHTML = this.convertSecsToMins(this.total_S)
    }, 1000
  )
}

Timer.prototype.stop = function () {
  clearInterval(this.intervalId)
  this.intervalId = null;
}

Timer.prototype.reset = function (initial_S = 0, elapsed_S=0) {
  this.initial_S = initial_S
  this.elapsed_S = elapsed_S
  this.total_S = initial_S + elapsed_S
  this.dispEle.innerHTML = this.convertSecsToMins(this.initial_S)
}

Timer.prototype.convertSecsToMins = function (seconds) {
  let mins = Math.floor(seconds / 60).toString();
  let secs = Math.floor(seconds % 60);
  secs = (secs < 10 ? '0' + secs.toString() : secs.toString());
  return `${mins}:${secs}`
}