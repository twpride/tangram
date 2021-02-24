import numpy as np
import cv2 as cv
import os
from pprint import pprint
import json


im = cv.imread(path_to_image)
imgray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)

ret, thresh = cv.threshold(imgray, 160, 255, 1)
col = cv.cvtColor(thresh, cv.COLOR_GRAY2BGR)

contours, hi = cv.findContours(thresh, cv.RETR_CCOMP,
                                cv.CHAIN_APPROX_TC89_KCOS)

for j in range(len(contours)):
  coord = np.empty([0, 2])
  cnt = contours[j]

  m00, m10, m01, *rest = cv.moments(cnt).values()

  if m00 <= 4000:
    continue

  x = cnt[:, 0, 0]
  y = cnt[:, 0, 1]
  coord = np.concatenate((coord, np.column_stack((x, y))))

  c = j
  if (c := hi[0][c][2]) != -1:
    while True:
      cnt = contours[c]
      neg_m00, neg_m10, neg_m01, *rest = cv.moments(cnt).values()

      if neg_m00 > 45:
        m00 -= neg_m00
        m10 -= neg_m10
        m01 -= neg_m01

        x = cnt[:, 0, 0]
        y = cnt[:, 0, 1]
        coord = np.concatenate((coord, np.full((1, 2), np.nan)))
        coord = np.concatenate((coord, np.column_stack((x, y))))

      if (c := hi[0][c][0]) == -1:
        break

  normalizedCoord = (coord - np.array([m10, m01]) / m00)