-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create issues table with spatial support
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('water','electrical','road','fire')),
  status text NOT NULL CHECK (status IN ('open','in-progress','resolved')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  geom geometry(Point,4326) NOT NULL
);

-- Create spatial index for fast bounding box queries
CREATE INDEX IF NOT EXISTS issues_geom_idx ON issues USING GIST (geom);

-- Create indexes for common filters
CREATE INDEX IF NOT EXISTS issues_category_idx ON issues (category);
CREATE INDEX IF NOT EXISTS issues_status_idx ON issues (status);
CREATE INDEX IF NOT EXISTS issues_updated_at_idx ON issues (updated_at);