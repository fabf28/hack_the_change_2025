import { pool } from "../configs/db";

export const ReportModel = {
  async createReport(
    report_id: string,
    report_time: string,
    category: string,
    category_details: string,
    description: string,
    geo_data: string,
    serverity: string,
    email: string,
    report_status: string,
    contractor_assigned: string,
    image_url: string | null
  ): Promise<string> {
    const sql = `INSERT INTO reports (report_id, report_time, category, category_details, description, geo_data, serverity, email, report_status, contractor_assigned, image_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 ON CONFLICT (report_id) DO NOTHING
                 RETURNING report_id, email;`;
    const result = await pool.query(sql, [
      report_id,
      report_time,
      category,
      category_details,
      description,
      geo_data,
      serverity,
      email,
      report_status,
      contractor_assigned,
      image_url,
    ]);
    return result.rows[0].report_id;
  },

  async idExists(report_id: string): Promise<boolean> {
    const sql = `SELECT EXISTS (SELECT 1 FROM reports WHERE report_id = $1);`;
    const result = await pool.query(sql, [report_id]);
    return result.rows[0].exists;
  },

  async getReportByID(report_id: string): Promise<any> {
    const sql = `SELECT * FROM reports WHERE report_id = $1;`;
    const result = await pool.query(sql, [report_id]);
    return result.rows[0];
  },
  async getAllReports(): Promise<any[]> {
    const sql = `SELECT * FROM reports ORDER BY report_time DESC;`;
    const result = await pool.query(sql);
    return result.rows;
  },
};
