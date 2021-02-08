import numpy as np
import cv2 as cv
import os
import matplotlib.pyplot as plt
from pprint import pprint


folderpath = './179/'
filelist = os.listdir(folderpath)
# filelist = filelist[3:4]
# filelist = filelist[10:11]
# filelist = filelist[1:2]
# for i in range(len(filelist)):

# for f in range(len(filelist)):
# for f in range(len(filelist)-1,len(filelist)):
for f in range(10,11):
  # plt.figure()

  res=[]
# im = cv.imread(folderpath+'tan17.jpg')
  im = cv.imread(folderpath+filelist[f])
  imgray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)
  
  for t in range(140,246,5):
    ret, thresh = cv.threshold(imgray, t, 255, 1)
    print('here')
    cv.imwrite(f"./thresh/{t}.png",thresh)