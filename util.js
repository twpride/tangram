export const createSVGNode = function (n, v) {
  n = document.createElementNS("http://www.w3.org/2000/svg", n);
  for (var p in v) n.setAttributeNS(null, p, v[p]);
  return n
}

export const setNode = function (n, v) {
  n = document.getElementById(n)
  for (var p in v) n.setAttributeNS(null, p, v[p]);
  return n
}
