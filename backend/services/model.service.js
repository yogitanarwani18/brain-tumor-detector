import axios from "axios";
import FormData from "form-data";

export const sendImageToModel = async (file) => {
  const formData = new FormData();

  formData.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const response = await axios.post(
    process.env.PYTHON_MODEL_URL,
    formData,
    {
      headers: formData.getHeaders(),
    }
  );

  console.log("RAW PYTHON MODEL RESPONSE:", response.data);

  return response.data;
};