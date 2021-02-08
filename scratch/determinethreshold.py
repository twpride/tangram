import numpy as np
import cv2 as cv
import os
import matplotlib.pyplot as plt

folderpath = './179/'
filelist = os.listdir(folderpath)
ans = []

rr =range(105,180,5)
for i in range(len(filelist)):
  im = cv.imread(folderpath+filelist[i])
  imgray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)
  
  res = []
  for val in rr:
    ret, thresh = cv.threshold(imgray, val, 255, 1)
    col = cv.cvtColor(thresh, cv.COLOR_GRAY2BGR)
    contours, hierarchy = cv.findContours(thresh, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_TC89_KCOS)

    # cv.drawContours(im, contours[9:10], -1, (0,255,0), 1)
    tt = 0
    for j in range(len(contours)):
      cnt = contours[j]
      area = cv.contourArea(cnt)
      # if area<5000: continue
      tt+=len(cnt)

      # res.append([area, [x[0] for x in cnt]])
      # for pos in cnt:
      #   # print(pos[0][0],)
      #   cv.drawMarker(im, (pos[0][0],pos[0][1]), color=(0,255,0), markerType=cv.MARKER_SQUARE, markerSize=1)

    # print(tt,"tt")
    res.append(tt)
    # cv.imshow("Keypoints", im)
    # cv.waitKey(0)

  ans.append(res)

na = np.array(ans)
plt.ion()
x = list(rr)

for i,y in enumerate(ans):
  plt.plot(x,y,label=filelist[i])

# plt.legend()

# plt.plot(x,np.mean(na,axis=0),".",label=filelist[i])
