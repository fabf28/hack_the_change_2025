import { pool } from "../configs/db"

export const ReportModel = {
    async createReport(report_id: string, report_time: string, category: string, geo_data: string, serverity: string, email: string, phone_number: string, report_status: string, contractor_assigned: string): Promise<string> {
        const sql = `INSERT INTO reports (report_id, report_time, category, geo_data, serverity, email, phone_number, report_status, contractor_assigned)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     ON CONFLICT (report_id) DO NOTHING
                     RETURNING report_id, email;`
        const result = await pool.query(sql, [report_id, report_time, category, geo_data, serverity, email, phone_number, report_status, contractor_assigned]);
        return result.rows[0].report_id;
    },
    async idExists(report_id: string): Promise<boolean> {
        const sql = `SELECT EXISTS (SELECT 1 FROM reports WHERE report_id = $1);`;
        const result = await pool.query(sql, [report_id]);
        return result.rows[0].exists;
    },

    async getReportByID(report_id: string): Promise<string> {
        const sql = `SELECT * FROM reports WHERE report_id = $1;`;
        const result = await pool.query(sql, [report_id]);
        return result.rows[0].report_id;
    }
}