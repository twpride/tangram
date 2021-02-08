import numpy as np
import cv2 as cv
import os
import matplotlib.pyplot as plt
from pprint import pprint
import matplotlib.patches as patches
import json

folderpath = './179/'
filelist = os.listdir(folderpath)
filelist.sort(key=lambda x: int(x[3:-4]))
# filelist = filelist[3:4]
# filelist = filelist[10:11]
# filelist = filelist[1:2]
# for i in range(len(filelist)):

plt.ion()
fig, ax = plt.subplots()

res = []

kk = 3
for f in range(kk, kk + 1):

# for f in range(len(filelist)):
  # plt.figure()
  print(filelist[f])
  # im = cv.imread(folderpath+'tan17.jpg')
  im = cv.imread(folderpath + filelist[f])
  imgray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)

  ret, thresh = cv.threshold(imgray, 140, 255, 1)
  # ret, thresh = cv.threshold(imgray, 215, 255, 1)
  col = cv.cvtColor(thresh, cv.COLOR_GRAY2BGR)
  contours, hi = cv.findContours(thresh, cv.RETR_CCOMP,
                                #  cv.CHAIN_APPROX_TC89_KCOS)
                                 cv.CHAIN_APPROX_NONE )

  tt = 0
  for j in range(len(contours)):
    coord = np.empty([0, 2])
    cnt = contours[j]

    m00, m10, m01, *rest = cv.moments(cnt).values()

    if m00 <= 4000:
      continue

    # for pos in cnt:
    #   cv.drawMarker(im, (pos[0][0], pos[0][1]),
    #                 color=(0, 255, 0),
    #                 markerType=cv.MARKER_SQUARE,
    #                 markerSize=1)
    # breakpoint()
    # pp = np.concatenate((cnt, cnt[:1]), axis=0)
    x = cnt[:, 0, 0]
    y = cnt[:, 0, 1]
    ax.plot(x, -y)
    coord = np.concatenate((coord, np.column_stack((x, y))))

    c = j
    # print(hi[0][c][2], j) 
    if (c := hi[0][c][2]) != -1:
      while True:
        cnt = contours[c]
        neg_m00, neg_m10, neg_m01, *rest = cv.moments(cnt).values()

        if neg_m00 > 45:
          m00 -= neg_m00
          m10 -= neg_m10
          m01 -= neg_m01

          # for pos in cnt:
          #   cv.drawMarker(im, (pos[0][0], pos[0][1]),
          #                 color=(0, 255, 0),
          #                 markerType=cv.MARKER_SQUARE,
          #                 markerSize=1)

          x = cnt[:, 0, 0]
          y = cnt[:, 0, 1]
          ax.plot(x, -y)
          coord = np.concatenate((coord, np.full((1, 2), np.nan)))
          coord = np.concatenate((coord, np.column_stack((x, y))))
        
        if (c := hi[0][c][0]) ==-1: break

    plt.text(contours[j][0][0][0], -contours[j][0][0][1], str(j))

    coord = (coord - np.array([m10,m01])/m00).tolist()
    coord.append(m00)
    
    print(len(res),j)
    res.append(coord)


  plt.axis('equal')
  # pprint(res)
# cv.imshow("Keypoints", im)
# cv.waitKey(0)


# with open('./179.js', 'w') as outfile:
#   json.dump(res, outfile)


