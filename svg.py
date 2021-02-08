from svgpathtools import svg2paths2, wsvg, Line, Path
import math
import numpy as np
from pprint import pprint
import json
import os

problemsFolder = './problems/'

filelist = os.listdir(problemsFolder)
res = []

for f in range(len(filelist)):
  filepath = problemsFolder + filelist[f]
  print(f,filepath)


  polygonPaths, attributes, svg_attributes = svg2paths2(filepath)

  for at in attributes:
    at['style']='fill:#d40000;stroke:#d40000;stroke-width:6;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none'

  # print(len(polygonPaths),polygonPaths)
  polyLengths = []
  centroids = []
  for path in polygonPaths:
    idx_del = []
    edgeLs = []
    vsum = 0
    for j in range(len(path)):
      diff = path[j].start - path[j].end
      dist = abs(diff)
      if dist < 0.1:
        idx_del.append(j)
      else:
        vsum += path[j].start
        edgeLs.append(dist)

    for i in reversed(idx_del): ## MUTATING ARRAY
      del path[i]

    centroids.append(vsum / len(path))
    polyLengths.append(edgeLs)

    if len(edgeLs) == 4 and edgeLs[0] - edgeLs[1] < 1:
      tL = edgeLs[0]

  cs = []
  for i in range(len(polygonPaths)):
    path = polygonPaths[i]
    lengths = polyLengths[i]
    # print(path,centroids[i])
    if len(lengths) == 3:
      test = min(lengths) / tL
      if test < 1.3:
        case = 5
      elif 1.3 < test < 1.5:
        case = 4
      else:
        case = 1
    elif len(lengths) == 4:
      if abs(lengths[0] - lengths[1]) > 1:
        case = 2
      else:
        case = 3

    for j in range(len(lengths)):
      curUnit = path[j].unit_tangent()
      prevUnit = path[j - 1].unit_tangent()

      mult = (prevUnit.conjugate() * curUnit)

      cross = mult.imag
      dot = mult.real

      if case in [1, 4, 5]:
        if 1 - abs(cross) < 0.01:
          ovec = curUnit if cross > 0 else -prevUnit
          break
      elif case == 2:
        if dot < 0:
          if abs(tL - lengths[j]) < 1:
            ovec = curUnit
          else:
            ovec = prevUnit
          break
      elif case == 3:
        ovec = curUnit
        break
    ori = math.atan2(ovec.imag, ovec.real) / math.pi * 180

    round45 = round(ori / 45) * 45
    diff = round(ori / 3) * 3 - round45
    ori = round45 + (diff if abs(diff) >= 7.5 else 0)
    cs.append((case,centroids[i],ori))

    # polygonPaths.append(Path(Line(start=centroids[i], end=centroids[i]+ovec*25)))
    # attributes.append(attributes[0])

  cs.sort(key=lambda x: x[0])
  edges = []
  for i in range(len(cs)-1):
    for j in range(i+1,len(cs)):
      edges.append([cs[j][1]-cs[i][1], i, j])

  edges.sort(key=lambda x: abs(x[0]))

  dset = list(range(7)) #disjoint set

  tree = []

  def find(x):
    if dset[x] != x:
      dset[x] = find(dset[x])
    return dset[x] 

  n=0
  for cost, i , j in edges:
    x, y =find(i),find(j)
    if x != y:
      dset[y] = x
      tree.append((cost.real,cost.imag, i,j))
      # polygonPaths.append(Path(Line(start=cs[i][1], end=cs[j][1])))
      # attributes.append(attributes[0])
      n+=1
      if n==len(centroids)-1: break
  
  name = filelist[f]
  wsvg(polygonPaths, attributes=attributes, svg_attributes=svg_attributes, filename=f'./mod/{f}.svg')
  res.append((tree, [x[2] for x in cs]))
  # pprint(res)


with open('./data.txt', 'w') as outfile:
  json.dump(res, outfile)
