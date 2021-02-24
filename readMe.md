<h1 align="center">179 Tangrams</h1>

<div align="center" >
  <a href="https://twpride.github.io/tangram/">
  Live Site
  </a>
</div>


<br/>





<h3 align="center">
Screen Shots
</h3>
<br/>
<p align="center">
  <img width="480" height="auto" src="https://raw.githubusercontent.com/twpride/tangram/master/demo/collision_opt.gif">
</p>
<p align="center">
  <img width="480" height="auto" src="https://raw.githubusercontent.com/twpride/tangram/master/demo/gameplay_opt.gif">
</p>
<p align="center">
  <img width="480" height="auto" src="https://raw.githubusercontent.com/twpride/tangram/master/demo/slider_opt.gif">
</p>

https://github.com/twpride/tangram/blob/0c07e642bfcd7f677e55f7b4df2e97870f300b03/cubicBezier.js#L28-L40


### Overview
179 Tangrams is a browser implementation of a classic Chinese puzzle using JavaScript and the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). The puzzle consists of seven polygons, which are put together to form shapes. The objective is to replicate a pattern (given only an outline) generally found in a puzzle book using all seven pieces without overlap.


## Game timing and scoring mechanics
- Player are scored by how quickly he/she can solve a level. 
- Once the player clicks on the level icon to start the puzzle, and a timer immediate starts
- The timer is stopped whenever the user exits the level (by hitting pause, or switching to another tab) or when the puzzle is solved.
- In the level selector menu, the player can preview the problem hovering over the level icon. Unsolved problems are blurred in the preview to prevent the player from getting a head start before staring the timer
- The level selector menu also functions as a heat map that tracks the player's progress. The heat maps colors each level icon depending on elapse time and solve state of each level. 


### Source of the puzzles
- Instead of generating the problem manually, examples of tangram problems found online were leveraged.
- The 179 puzzles in this game was taken from a [puzzle booklet](https://web.archive.org/web/20200203050759/https://www.cs.brandeis.edu/~storer/JimPuzzles/ZPAGES/zzzRichter08-AnchorPuzzle.html) first published in 1890 by the Richter Company of Germany in 1890.
- The problems was extracted from scanned images of puzzle booklet with a python script using OpenCv's `findContours()`.


### Collision Detection
- To add to the realism, the game incorporates a collision checking algorithm
- After every piece move, the game checks if there are any intersections between moving piece and the static pieces



```javascript
const cross = (v, w) => v[0] * w[1] - v[1] * w[0];
const dot = (v, w) => v[0] * w[0] + v[1] * w[1];
const toVec = (a, b) => [b[0] - a[0], b[1] - a[1]];

function findIntersection(p, r, q, s) {
  // 
  // https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
  const q_minus_p = toVec(p, q);
  const r_cross_s = cross(r, s);
  if (r_cross_s === 0) return null;
  return cross(q_minus_p, r) / r_cross_s;
}

function calcPenetration(shapeVertices, point, lastMouseMove) {
  // calculate the penetration (if any) of a point into a shape after latest mouse move 
  // the penetration quantity is in vector form and has units of pixels
  let prev = shapeVertices[shapeVertices.length - 1];
  for (let k = 0; k < shapeVertices.length; k++) {
    const currVertex = shapeVertices[k];
    const edgeVec = toVec(currVertex, prev);
    const res = findIntersection(currVertex, edgeVec, point, lastMouseMove)
    if (res
      && res >= 0 // res==0, when point(q) start out already on line (p,p+r)
      && res < 1 // res==1, when mouse pos after lastMouseMove is right on line (p,p+r)
    ) {
      const p_currVertex_vec = toVec(point, currVertex);
      const precalc = dot(p_currVertex_vec, edgeVec) / (edgeVec[0] ** 2 + edgeVec[1] ** 2);
      return p_currVertex_vec.map((ele, idx) => ele - precalc * edgeVec[idx]);
    }
    prev = currVertex;
  }
  return null;
}
```


## Shape Rotation



### Puzzle solve state detection

- In order to record the time to completion for a puzzle, a method of detecting whether a puzzle was solved was need.
- The  

### Custom Carousel Element
- To allow for smooth transition between pages, the carousel utilizes a [Bezier easing function](https://github.com/gre/bezier-easing) to generate the animation of snapping to a page.

``` javascript
cardSlideLoop(timestamp) {
  if (!this.cardSlideStartTime) { // in first requestAnimationFrame call
    this.cardSlideStartTime = timestamp; // save starting timestamp of animation
    this.viewBoxMinXStart = this.viewBoxMinX; // save starting x-position of viewBox
    this.delta = this.pg * this.svg_w - this.viewBoxMinX; // relative distance to final x-position of viewBox
  }
  const elapsed = timestamp - this.cardSlideStartTime;
  if (elapsed < 200) { // when animation is stil running
    const newViewBoxMinX = this.viewBoxMinXStart + this.bezier(elapsed / 200) * this.delta;
    this.selectorSvg.setAttribute('viewBox', `${newViewBoxMinX} 0 ${this.svg_w} ${this.svg_h}`)
    requestAnimationFrame(this.cardSlideLoop);
  } else { // when animation completes
    this.viewBoxMinX = this.viewBoxMinXStart + this.delta;
    this.selectorSvg.setAttribute('viewBox', `${this.viewBoxMinX} 0 ${this.svg_w} ${this.svg_h}`)
    this.cardSlideStartTime = null;
  }
}
```

- The heatmap was generated by formatting an [HSL](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#hsl_colors) color string which becomes an attributes of a SVG [&lt;rect&gt;](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect) element.

```javascript
if (score < this.game.criteria) { // if the puzzle was solved
  const colorAngle = 120 - Math.floor((timeFraction > 1 ? 1 : timeFraction) * 120);
  color = `hsl(${colorAngle}, 100%, 50%)`
  this.game.progress[2] += 1
} else {
  if (time > 0) { // puzzle unsolved but attempted
    const saturationPercent = Math.floor((timeFraction > 1 ? 1 : timeFraction) * 100);
    color = `hsl(240, ${saturationPercent}%, 73%)`
    this.game.progress[1] += 1
  } else { // unattempted puzzle
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

```






### Game Controls

- Piece translation
  - Mouse: Left click and drag
  - Touch: Tap and drag
- Piece rotation
  - Mouse: Right click and drag
  - Two-finger touch: With 1 finger touching the piece, drag with second finger
  - One-finger touch: Double tap piece. Drag on second tap
- Lifting a piece up
  - Mouse: double click
  - With touch: long press
  - Lifted pieces can move through other pieces
- Flipping the parallelogram
  - Click on button below the play/pause button.
- Exiting or pausing the puzzle
  - Click the pause button, or press <Escape>


