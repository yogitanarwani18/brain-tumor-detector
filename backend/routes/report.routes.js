import express from "express";
import { uploadMRI } from "../config/multer.js";
import { analyzeMRI, getReports } from "../controllers/report.controller.js";

const router = express.Router();

router.post("/upload", uploadMRI.single("image"), analyzeMRI);
router.get("/", getReports);

export default router;