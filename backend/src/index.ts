import express, { Request, Response } from "express";
import { ReportModel } from "./models/reportModel";
import { nanoid } from "nanoid";

const app = express();
const PORT = 3000;

// Example POST endpoint
app.post('/api/report', async (req, res) => {
    const { category, geo_data, serverity, email, phone_number, contractor_assigned } = req.body;

    //generate id
    const report_id = nanoid(8);
    const exists = await ReportModel.idExists(report_id);

    while (exists) {
        const report_id = nanoid(8);
        const exists = await ReportModel.idExists(report_id);
    }

    //custom status
    const report_status = "Submitted";

    //generate time
    const report_time = Date.now().toString();

    //image url

    const result = await ReportModel.createReport(report_id, report_time, category, geo_data, serverity, email, phone_number, report_status, contractor_assigned);

    console.log('Received:', result);

    // You can process or save this data to a database here
    res.status(201).json({
        message: 'User created successfully',
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
