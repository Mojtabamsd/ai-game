import os
import cv2
import numpy as np
import joblib
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from feature_uvpec import feature_uvpec

# Define dataset path
DATASET_PATH_TRAIN = "../public/dataset/train"
CATEGORIES = ["Copepods", "Aulatractus", "Cnidaria", "Detritus"]

# Feature extraction function
def extract_features(image_path):
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    img = cv2.resize(img, (128, 128))

    feature_dict = feature_uvpec(img, image_path)
    feature_arr = np.array(list(feature_dict.values()))
    return feature_arr

# Load dataset
X_train, y_train = [], []
for label, category in enumerate(CATEGORIES):
    category_path = os.path.join(DATASET_PATH_TRAIN, category)
    for file in os.listdir(category_path):
        if file.endswith(".png"):
            img_path = os.path.join(category_path, file)
            X_train.append(extract_features(img_path))
            y_train.append(label)

# Train classifier
clf = SVC(kernel="linear", probability=True)
clf.fit(X_train, y_train)

# Save model
joblib.dump(clf, "../server/plankton_classifier.pkl")
print("Model trained and saved!")
