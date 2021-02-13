export const createSVGNode = function (n, v) {
  n = document.createElementNS("http://www.w3.org/2000/svg", n);
  for (var p in v) n.setAttributeNS(null, p, v[p]);
  return n
}

export const setNode = function (id, v) {
  const node = document.getElementById(id);
  for (var p in v) node.setAttribute(p, v[p]);
  return node
}


export const setClassNodes = function (cl, v) {
  const collection = document.getElementsByClassName(cl)
  for (let node of collection) {
    for (var p in v) node.setAttribute(p, v[p]);
  }
}