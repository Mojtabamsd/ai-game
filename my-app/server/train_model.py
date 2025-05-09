import os
import json
import cv2
import numpy as np
import joblib
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score
import sys
from feature_uvpec import feature_uvpec

# Read input arguments
training_data_path = sys.argv[1]
model_output_path = sys.argv[2]
test_data_path = sys.argv[3]

# Define base dataset directory
BASE_DATASET_PATH = os.path.join(os.path.dirname(__file__), "../public")

# Load user-sorted training data
with open(training_data_path, "r") as f:
    sorted_images = json.load(f)

# Feature extraction function
def extract_features(image_path):
    full_image_path = os.path.join(BASE_DATASET_PATH, image_path.lstrip("/"))
    img = cv2.imread(full_image_path, cv2.IMREAD_GRAYSCALE)

    if img is None:
        print(f"Error: Could not read image {full_image_path}")  # Debugging
        return None  # Skip bad images

    img = cv2.resize(img, (128, 128))
    feature_dict = feature_uvpec(img, image_path)
    feature_arr = np.array(list(feature_dict.values()))
    return feature_arr

# Prepare training dataset
X_train, y_train = [], []
categories = list(sorted_images.keys())
for label, category in enumerate(categories):
    for image_path in sorted_images[category]:
        features = extract_features(image_path)
        if features is not None:  # Skip invalid images
            X_train.append(features)
            y_train.append(label)

# Train classifier
clf = SVC(kernel="linear", probability=True)
clf.fit(X_train, y_train)

# Save the trained model
joblib.dump(clf, model_output_path)

# Load test dataset
X_test, y_test = [], []
for label, category in enumerate(categories):
    category_path = os.path.join(test_data_path, category)
    if os.path.exists(category_path):
        for file in os.listdir(category_path):
            if file.endswith(".png"):
                img_path = os.path.join(category_path, file)
                X_test.append(extract_features(img_path))
                y_test.append(label)

# Evaluate model
if X_test:
    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred) * 100
else:
    accuracy = 0.0

print(f"{accuracy:.2f}")