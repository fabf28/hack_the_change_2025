import express from "express";
import cors from "cors";
import issuesRoute from "./issues-route";

const app = express();
app.use(cors());
app.use("/api/issues", issuesRoute);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => console.log(`✅ API running on http://localhost:${port}/api/issues`));
