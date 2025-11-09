// src/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { ReportModel } from "./models/reportModel";
import FormData from "form-data";
import fetch from "node-fetch";

const app = express();
const PORT = 9000;

// Flask server URL - update this to match your Flask server
const FLASK_SERVER_URL =
  process.env.FLASK_SERVER_URL || "http://127.0.0.1:5000";

// Add CORS middleware FIRST (before other middleware)
app.use(cors());

// Parse JSON for non-multipart routes
app.use(express.json());

// Multer setup to parse multipart/form-data and keep file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// S3 client (uses env creds automatically: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_SESSION_TOKEN)
const s3 = new S3Client({
  region: process.env.AWS_REGION, // e.g. "us-east-1"
});

const S3_BUCKET = process.env.S3_BUCKET as string; // e.g. "my-app-uploads"
const S3_PUBLIC_URL_BASE =
  process.env.S3_PUBLIC_URL_BASE ||
  `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;

/**
 * Helper function to call Flask /scan endpoint
 */
async function classifyImage(
  imageBuffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const formData = new FormData();
  formData.append("image", imageBuffer, {
    filename: filename,
    contentType: mimetype,
  });

  const response = await fetch(`${FLASK_SERVER_URL}/scan`, {
    method: "POST",
    body: formData,
    headers: formData.getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Flask scan failed: ${errorData.error || response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(`Classification failed: ${data.error || "Unknown error"}`);
  }

  return data.result;
}

// Example POST endpoint (now accepts an image and classifies it)
app.post(
  "/api/report",
  upload.single("image"), // expect file field named "image"
  async (req: Request, res: Response) => {
    try {
      // NOTE: Multer puts text fields on req.body (as strings) and file on req.file
      const {
        category,
        geo_data,
        description,
        serverity, // keeping your field name as-is; if this is a typo, change to "severity" across your codebase
        email,
        contractor_assigned,
      } = req.body;

      // generate unique report_id
      let report_id = nanoid(8);
      while (await ReportModel.idExists(report_id)) {
        report_id = nanoid(8);
      }

      // custom status & time
      const report_status = "Submitted";
      const report_time = Date.now().toString();

      // optional image upload to S3 and classification
      let image_url: string | null = null;
      let classification: any | null = null;
      let classification_data: any | null = null;

      if (req.file) {
        // First, classify the image using Flask server
        try {
          classification_data = await classifyImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
          );

          classification_data = JSON.parse(classification_data);
          classification = classification_data.label;
          console.log("Image classification:", classification);
        } catch (classifyError) {
          console.error("Classification error:", classifyError);
          // You can choose to continue without classification or return an error
          // For now, we'll continue but log the error
        }

        // Then upload to S3
        const imageId = nanoid(16);
        const ext = path.extname(req.file.originalname || "") || ""; // keep original extension if present
        const key = `reports/${imageId}${ext}`;

        await s3.send(
          new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          })
        );

        image_url = `${S3_PUBLIC_URL_BASE}/${key}`;
      }

      console.log("hi");
      console.log("RT: ", report_time);
      console.log("Classification: ", classification);

      // You'll need to update your ReportModel.createReport to accept classification
      // For now, I'm assuming you'll add it as a parameter or modify the category
      const result = await ReportModel.createReport(
        report_id,
        report_time,
        classification || category,
        classification_data, // Use classification if available, otherwise use provided category
        description,
        geo_data,
        serverity,
        email,
        report_status,
        contractor_assigned,
        image_url
      );

      console.log("Received:", result);

      return res.status(201).json({
        message: "Report created successfully",
        report_id,
        image_url,
        classification, // Include classification in response
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to create report" });
    }
  }
);

app.get("/api/reports", async (req: Request, res: Response) => {
  try {
    const reports = await ReportModel.getAllReports();
    return res.status(200).json({
      message: "Reports retrieved successfully",
      count: reports.length,
      reports,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to retrieve reports" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
