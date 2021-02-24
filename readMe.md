<h1 align="center">179 Tangrams</h1>
 
<div align="center" >
 <a href="https://twpride.github.io/tangram/">
 Live Site
 </a>
</div>
 
179 Tangrams is a browser implementation of a classic Chinese puzzle using JavaScript and the [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). The puzzle consists of seven polygons, which are put together to form shapes. The objective is to replicate a pattern (given only an outline) generally found in a puzzle book using all seven pieces without overlap 
<br/>
<br/>


 

<br/>



<h3 align="center">
  Custom carousel element with integrated heat map showing game progress
</h3>

 
https://github.com/twpride/tangram/blob/0c07e642bfcd7f677e55f7b4df2e97870f300b03/cubicBezier.js#L28-L40
 
 
.
 
 

 
 
## Puzzle generation
- Instead of generating the problem manually, examples of tangram problems found online were leveraged.
- The 179 puzzles in this game was taken from a [puzzle booklet](https://web.archive.org/web/20200203050759/https://www.cs.brandeis.edu/~storer/JimPuzzles/ZPAGES/zzzRichter08-AnchorPuzzle.html) first published in 1890 by the Richter Company of Germany in 1890.
- The problems were extracted from scanned images of the puzzle booklet with a python script using OpenCv's `findContours()`.
 
 
### Collision Detection
- After every piece move, the game checks if the moving piece has collided.
 
- If there was a collision, the penetration amount between the penetrating vertex and the penetrated edge is calculated
 
- The moving piece is then shifted back by the calculated intersection amount ensuring that the pieces are no longer colliding
 
<h3 align="center">
  Tangram puzzle pieces with collision detection
</h3>
<p align="center">
 <img width="480" height="auto" src="https://raw.githubusercontent.com/twpride/tangram/master/demo/collision_opt.gif">
</p>


 
# Solve state detection

<p align="center">
 <img width="480" height="auto" src="https://raw.githubusercontent.com/twpride/tangram/master/demo/gameplay_opt.gif">
</p>

 
- Detection of the puzzle solve state is done using a raster based method of overlap detection.
 
- Following every piece move, the silhouette followed by the tangram pieces were painted onto a secondary canvas.
 
- By ensuring that the geometric centers of the silhouette and the tangram pieces align, it follows that there is maximum overlap between the tangram pieces and the silhouette when the puzzle is solved. Conversely, this means that the non-overlapping areas of the silhouette is at a minimum.
 
- To detect this solved state where the non-overlapping silhouette area is at a minimum, we set both the canvas background and the tangram shapes to black (rgb(0,0,0)) while the silhouette set to any non-black color which in our case was cyan, most importantly with a red color value of 1, rgb(1,255,255).
 
- Since the tangrams shapes are painted after the silhouette, any overlapping areas will be set to black, whereas the non-overlapping areas of the silhouette remain cyan.
 
- After every piece move, the program sums the red pixel values of all the pixels on the secondary canvas. Since we had set the silhouette to have a red color value of 1, the sum is also the number of pixels of silhouette that is non-overlapping.

If the non-overlap pixel count is below a certain threshold (empirically determined), we can conclude that the player has solved the puzzle. 
 
 

<h3 align="center">
  The Carousel Element
</h3>
<p align="center">
 <img width="480" height="auto" src="https://raw.githubusercontent.com/twpride/tangram/master/demo/slider_opt.gif">
</p>

- Players are scored by how quickly he/she can solve a level. Once the player clicks on the level icon to start the puzzle, and a timer immediate starts
- The timer is stopped whenever the user exits the level (by hitting pause, or switching to another tab) or when the puzzle is solved.
- In the level selector menu, the player can preview the problem hovering over the level icon. Unsolved problems are blurred in the preview to prevent the player from getting a head start before starting the timer
- The level selector menu also functions as a heat map that tracks the player's progress. The heat maps colors each level icon depending on elapsed time and solve state of each level.
- The heat map adds a badge-like reward mechanism to the gameplay experience. The user may be motivated to fill up the entire carousel with green boxes :)


- To allow for smooth transition between pages, the carousel utilizes a [Bezier easing function](https://github.com/gre/bezier-easing) to generate the animation of snapping to a page.
 
- The heatmap was generated by formatting an [HSL](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#hsl_colors) color string which becomes an attributes of a SVG [&lt;rect&gt;](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect) element.
 

 
 
### Game Controls
- Piece translation
 - Mouse: Left click and drag
 - Touch: Tap and drag
- Piece rotation
 - Mouse: Right click and drag
 - Two-finger touch: With 1 finger touching the piece, drag with second finger
 - One-finger touch: Double tap piece. Drag on second tap
- Lifting a piece up (so it can move through other pieces)
 - Mouse: double click
 - With touch: long press
- Flipping the parallelogram
 - Click on the button below the play/pause button.
- Exiting or pausing the puzzle
 - Click the pause button, or press <Escape>
 
 
 
 







