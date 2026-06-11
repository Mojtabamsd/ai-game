import os
import json
import cv2
import numpy as np
import joblib
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
import sys
import warnings
warnings.filterwarnings("ignore")
from feature_uvpec import feature_uvpec

# Read input arguments
training_data_path = sys.argv[1]
model_output_path = sys.argv[2]
test_data_path = sys.argv[3]

# Base public directory — used to resolve training image paths like /dataset/train/...
BASE_PUBLIC_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../public")

def extract_features(image_path, is_absolute=False):
    """
    image_path: either an absolute path (for test images)
                or a web-style path like /dataset/train/Copepods/xxx.png (for training images)
    """
    if is_absolute:
        full_image_path = image_path
    else:
        # Strip leading slash and join with public dir
        full_image_path = os.path.join(BASE_PUBLIC_PATH, image_path.lstrip("/"))

    full_image_path = os.path.normpath(full_image_path)
    img = cv2.imread(full_image_path, cv2.IMREAD_GRAYSCALE)

    if img is None:
        print(f"Warning: Could not read image {full_image_path}", file=sys.stderr)
        return None

    img = cv2.resize(img, (128, 128))
    max_value = np.iinfo(img.dtype).max
    inverted_array = max_value - img
    feature_dict = feature_uvpec(inverted_array, image_path)
    feature_arr = np.array(list(feature_dict.values()))
    return feature_arr

# Load user-sorted training data
with open(training_data_path, "r") as f:
    sorted_images = json.load(f)

# Prepare training dataset
X_train, y_train = [], []
categories = list(sorted_images.keys())
for label, category in enumerate(categories):
    for image_path in sorted_images[category]:
        features = extract_features(image_path, is_absolute=False)
        if features is not None:
            X_train.append(features)
            y_train.append(label)

if not X_train:
    print("0.00")
    sys.exit(0)

# Train classifier
clf = SVC(kernel="linear", probability=True)
clf.fit(X_train, y_train)

# Save the trained model
joblib.dump(clf, model_output_path)

# Load test dataset — these are absolute filesystem paths
X_test, y_test = [], []
for label, category in enumerate(categories):
    category_path = os.path.join(test_data_path, category)
    if os.path.exists(category_path):
        for file in os.listdir(category_path):
            if file.endswith(".png"):
                img_path = os.path.join(category_path, file)
                features = extract_features(img_path, is_absolute=True)
                if features is not None:
                    X_test.append(features)
                    y_test.append(label)

# Evaluate model
if X_test:
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred) * 100
else:
    accuracy = 0.0

print(f"{accuracy:.2f}")
