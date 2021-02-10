



function getNode(n, v) {
  n = document.createElementNS("http://www.w3.org/2000/svg", n);
  for (var p in v) n.setAttributeNS(null, p, v[p]);
  return n
}

export function Colormap() {

  // const targetDiv = document.getElementById('svg');
  const targetDiv = document.getElementById('menu');


  const svgNode = getNode('svg', {
    'viewBox':'0 0 1000 1000',
    width: '400px',
    height: '400px'
  })

  targetDiv.appendChild(svgNode);

  // const circle = getNode('circle', { cx: 50, cy: 50, r: 50, fill: 'blue'});
  // const rect = getNode('rect', { x: 50, y: 50, height: 50, width: 50, fill: 'blue'});
  
  const size = 6;
  const pitch = 7.3;
  const nrow = 10;
  const ncol = 18;

  for (let j=0; j<ncol; j++) {
    for (let i=0; i<nrow; i++) {
      const rect = getNode('rect', { x: j*pitch, y: i*pitch, height: size, width: size, fill: 'blue'});
      svgNode.appendChild(rect);
    }
  }

}





// <Svg height="100" width="380"
// onStartShouldSetResponder={e => console.log(e.nativeEvent)}
// >
// {
//   buckets && buckets.map((eli, i) => (
//     eli.map((elj, j) => (
//       <Rect
//         key={i.toString() + j.toString()}
//         x={i * PITCH}
//         y={j * PITCH}
//         height={SIZE}
//         width={SIZE}
//         fill={COLORS[buckets[i][j]]}
//       />
//     ))
//   ))
// }
// </Svg>