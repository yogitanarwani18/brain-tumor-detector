import os

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import cv2
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.keras")
IMAGE_SIZE = 128

print(f"Loading model from: {MODEL_PATH}")
model = load_model(MODEL_PATH)
print("Model loaded successfully")
model.trainable = False
class_labels = [
    "Glioma",
    "Meningioma",
    "No Tumor",
    "Pituitary",
]


def preprocess_mri_image(file):
    image = Image.open(file.stream).convert("RGB")
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))

    img_array = img_to_array(image)

    img_array = cv2.GaussianBlur(img_array, (3, 3), 0)

    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    gray = gray.astype(np.uint8)

    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8),
    )
    gray = clahe.apply(gray)

    img_array = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    img_array = img_array.astype(np.float32)

    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array


@app.route("/", methods=["GET"])
def home():
    return jsonify(
        {
            "status": "success",
            "message": "Python MRI model API is running",
        }
    ), 200


@app.route("/predict", methods=["POST"])
def predict():
    try:
        print("Prediction request received")
        print("Uploaded fields:", list(request.files.keys()))

        if "file" not in request.files:
            return jsonify(
                {
                    "status": "error",
                    "error": "No file uploaded. Expected field name: file",
                }
            ), 400

        file = request.files["file"]

        if not file or not file.filename:
            return jsonify(
                {
                    "status": "error",
                    "error": "Uploaded file is empty",
                }
            ), 400

        print(f"Processing file: {file.filename}")

        processed_image = preprocess_mri_image(file)

        prediction = model(processed_image, training=False).numpy()

        predicted_index = int(np.argmax(prediction[0]))
        confidence = float(np.max(prediction[0]) * 100)

        if predicted_index >= len(class_labels):
            raise ValueError(
                f"Model returned invalid class index: {predicted_index}"
            )

        predicted_label = class_labels[predicted_index]

        result = {
            "status": "success",
            "prediction": predicted_label,
            "tumor_type": predicted_label,
            "confidence": round(confidence, 2),
        }

        print("Prediction result:", result)

        return jsonify(result), 200

    except Exception as error:
        print(f"Prediction error: {type(error).__name__}: {error}")

        return jsonify(
            {
                "status": "error",
                "error": str(error),
            }
        ), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,
    )