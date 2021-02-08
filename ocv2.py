import cv2
import numpy as np

# Read image

impre = cv2.imread("./179/tan142.jpg")
# impre = cv2.imread("./BlobTest.webp")
# impre = cv2.imread("./ex.png")

gray = cv2.cvtColor(impre, cv2.COLOR_BGR2GRAY)
ret, im = cv2.threshold(gray, 90, 255, 1)
# im = cv2.cvtColor(impre, cv2.COLOR_BGR2GRAY)


# im = cv2.imread("./ex.png", cv2.IMREAD_GRAYSCALE)

params = cv2.SimpleBlobDetector_Params() 
# Change thresholds
params.minThreshold = 2
# params.thresholdStep = 15
params.maxThreshold = 255


# Filter by Area.
params.filterByArea = False
params.minArea = 10

# Filter by Circularity
params.filterByCircularity = False
params.minCircularity = 0.1

# Filter by Convexity
params.filterByConvexity = False
params.minConvexity = 0.87

# Filter by Inertia
params.filterByInertia = False
params.minInertiaRatio = 0.01

# params.filterByColor = True
params.blobColor = 255

# Create a detector with the parameters
ver = (cv2.__version__).split('.')
if int(ver[0]) < 3 :
    detector = cv2.SimpleBlobDetector(params)
else: 
    detector = cv2.SimpleBlobDetector_create(params)

# Detect blobs.
keypoints = detector.detect(im)
print(len(keypoints),'keyp')
im_with_keypoints = cv2.drawKeypoints(im, keypoints, np.array([]), (0,0,255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
# cv2.imwrite("result.png",im_with_keypoints)

cv2.imshow("Keypoints", im_with_keypoints)
cv2.waitKey(0)