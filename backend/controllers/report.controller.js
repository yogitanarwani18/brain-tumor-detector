import { sendImageToModel } from "../services/model.service.js";

const reports = [];

export const analyzeMRI = async (req, res) => {
  try {
    console.log("Upload API hit");

    const { patientName, age, gender } = req.body;
    const file = req.file;

    console.log("Body:", req.body);
    console.log("File:", file?.originalname);

    if (!patientName || !age || !gender) {
      return res.status(400).json({
        message: "Patient name, age and gender are required",
      });
    }

    if (!file) {
      return res.status(400).json({
        message: "MRI image is required",
      });
    }

    const predictionData = await sendImageToModel(file);

    console.log("Python response:", predictionData);

    const prediction =
      predictionData.prediction ||
      predictionData.class ||
      predictionData.label ||
      predictionData.result ||
      "Unknown";

    const tumorType =
      predictionData.tumor_type ||
      predictionData.tumorType ||
      prediction;

    const confidence =
      predictionData.confidence ||
      predictionData.probability ||
      predictionData.score ||
      0;

    const report = {
      id: Date.now(),
      patientName,
      age,
      gender,
      imageName: file.originalname,
      prediction,
      tumorType,
      confidence,
      createdAt: new Date().toISOString(),
    };

    reports.unshift(report);

    return res.status(200).json({
      message: "MRI image analyzed successfully",
      result: report,
      reports,
    });
  } catch (error) {
    console.error("Analyze MRI Error:", error.message);

    return res.status(500).json({
      message: "Failed to analyze MRI image",
      error: error.message,
    });
  }
};

export const getReports = (req, res) => {
  return res.status(200).json({
    reports,
  });
};