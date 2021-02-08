import numpy as np
import cv2 as cv
import os
# import matplotlib.pyplot as plt

folderpath = './179/'
filelist = os.listdir(folderpath)
# filelist = filelist[3:4]
filelist = filelist[10:11]
res=[]
# for i in range(len(filelist)):



im = cv.imread(folderpath+'tan142.jpg')
cv.imshow("Keypoints", im)
cv.waitKey(0)


