from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import os
import cv2
from PIL import Image
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.preprocessing.image import img_to_array

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.keras")
IMAGE_SIZE = 128

model = load_model(MODEL_PATH)

class_labels = ["Glioma", "Meningioma", "No Tumor", "Pituitary"]


def preprocess_mri_image(file):
    image = Image.open(file).convert("RGB")
    image = image.resize((IMAGE_SIZE, IMAGE_SIZE))

    img_array = img_to_array(image)

    img_array = cv2.GaussianBlur(img_array, (3, 3), 0)

    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    gray = gray.astype("uint8")

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    gray = clahe.apply(gray)

    img_array = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    img_array = img_array.astype("float32")

    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Python MRI model API is running"
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({
                "error": "No file uploaded"
            }), 400

        file = request.files["file"]

        processed_image = preprocess_mri_image(file)

        prediction = model.predict(processed_image)

        predicted_index = int(np.argmax(prediction, axis=1)[0])
        confidence = float(np.max(prediction) * 100)

        predicted_label = class_labels[predicted_index]

        if predicted_label == "No Tumor":
            tumor_type = "No Tumor"
        else:
            tumor_type = predicted_label

        return jsonify({
            "prediction": predicted_label,
            "tumor_type": tumor_type,
            "confidence": round(confidence, 2)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)