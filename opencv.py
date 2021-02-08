# Standard imports
import cv2
import numpy as np;

# Read image
# impre = cv2.imread("./179/tan142.jpg")
# impre = cv2.imread("./BlobTest.webp")
impre = cv2.imread("./ex.png")

# gray = cv2.cvtColor(impre, cv2.COLOR_BGR2GRAY)
# ret, im = cv2.threshold(gray, 90, 255, 1)

im = cv2.cvtColor(impre, cv2.COLOR_BGR2GRAY)

# cv2.imshow("Keypoints", im)
# cv2.waitKey(0)
params = cv2.SimpleBlobDetector_Params()

# params.minThreshold = 10;
# params.maxThreshold = 200;

# Filter by Area.
# params.filterByArea = True
# params.minArea = 100
params.minThreshold = 100
params.maxThreshold = 255
params.filterByColor = True
params.blobColor = 255
params.filterByConvexity = False
params.filterByCircularity = False

# Set up the detector with default parameters.
detector = cv2.SimpleBlobDetector_create(params)

# Detect blobs.
keypoints = detector.detect(im)


# Draw detected blobs as red circles.
# cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS ensures the size of the circle corresponds to the size of blob
im_with_keypoints = cv2.drawKeypoints(im, keypoints, np.array([]), (0,0,255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)

# Show keypoints
cv2.imshow("Keypoints", im_with_keypoints)
cv2.waitKey(0)
