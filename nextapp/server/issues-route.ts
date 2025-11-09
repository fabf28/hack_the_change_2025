import express from "express";
import { pool } from "./db";
const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {
  try {
    const { bbox, category, status, since } = req.query;
    if (!bbox) return res.status(400).json({ error: "bbox required" });
    const [minLon, minLat, maxLon, maxLat] = String(bbox).split(",").map(Number);

    const params: (number | string | Date | string[])[] = [minLon, minLat, maxLon, maxLat];
    const clauses: string[] = [];
    clauses.push(`
      geom && ST_MakeEnvelope($1,$2,$3,$4,4326)
      AND ST_Intersects(geom, ST_MakeEnvelope($1,$2,$3,$4,4326))
    `);

    let i = 5;
    if (category) {
      const cats = Array.isArray(category) ? (category as string[]).map(String) : [String(category)];
      params.push(cats);
      clauses.push(`category = ANY($${i++})`);
    }
    if (status) {
      const stats = Array.isArray(status) ? (status as string[]).map(String) : [String(status)];
      params.push(stats);
      clauses.push(`status = ANY($${i++})`);
    }
    if (since) {
      params.push(new Date(String(since)));
      clauses.push(`updated_at >= $${i++}`);
    }

    const sql = `
      WITH q AS (
        SELECT id, title, category, status, updated_at,
               ST_AsGeoJSON(geom)::json AS geometry,
               jsonb_build_object(
                 'id', id, 'title', title, 'category', category,
                 'status', status, 'updatedAt', to_char(updated_at,'YYYY-MM-DD"T"HH24:MI:SS"Z"')
               ) AS properties
        FROM issues
        WHERE ${clauses.join(" AND ")}
      )
      SELECT jsonb_build_object(
        'type','FeatureCollection',
        'features', COALESCE(jsonb_agg(jsonb_build_object(
          'type','Feature','id', id,'geometry', geometry,'properties', properties
        )), '[]'::jsonb)
      ) AS fc
      FROM q;`;

    const { rows } = await pool.query(sql, params);
    res.set("Cache-Control", "no-store").json(rows[0].fc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
