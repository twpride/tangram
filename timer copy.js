

export class Timer extends HTMLElement {

  initial_S = 0;
  elapsed_S = 0;
  total_S = 0;
  intervalId = null;

  constructor() {
    super()
    this.innerHTML = Timer.convertSecsToMins(this.elapsed_S + this.initial_S);
  }

  start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(
      () => {
        if (document.visibilityState == 'hidden') return;
        this.elapsed_S += 1;
        this.total_S = this.initial_S + this.elapsed_S
        this.textContent = Timer.convertSecsToMins(this.total_S)
      }, 1000
    )
  }

  stop() {
    clearInterval(this.intervalId)
    this.intervalId = null;
  }

  reset(initial_S = 0, elapsed_S = 0) {
    this.initial_S = initial_S
    this.elapsed_S = elapsed_S
    this.total_S = initial_S + elapsed_S
    this.innerHTML = Timer.convertSecsToMins(this.initial_S)
  }

  static convertSecsToMins(seconds) {
    let mins = Math.floor(seconds / 60).toString();
    let secs = Math.floor(seconds % 60);
    secs = (secs < 10 ? '0' + secs.toString() : secs.toString());
    // return `${mins}:${secs}`.padStart(5)
    return `${mins}:${secs}`
  }

}


customElements.define("timer-ele", Timer);