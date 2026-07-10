import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import reportRoutes from "./routes/report.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Brain Tumor Detection Backend is running",
  });
});

app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});