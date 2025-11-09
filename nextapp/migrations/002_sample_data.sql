-- Sample data for Calgary area
INSERT INTO issues (title, category, status, geom) VALUES
  -- Downtown water issues
  ('Broken water main on 5th Ave', 'water', 'open',
   ST_SetSRID(ST_MakePoint(-114.0719, 51.0447), 4326)),
  ('Flooding in Plus 15', 'water', 'in-progress',
   ST_SetSRID(ST_MakePoint(-114.0629, 51.0484), 4326)),

  -- Beltline electrical
  ('Power outage in Connaught', 'electrical', 'open',
   ST_SetSRID(ST_MakePoint(-114.0815, 51.0398), 4326)),
  ('Flickering lights on 17th Ave', 'electrical', 'resolved',
   ST_SetSRID(ST_MakePoint(-114.0573, 51.0379), 4326)),

  -- NW road issues
  ('Pothole on Crowchild Trail', 'road', 'open',
   ST_SetSRID(ST_MakePoint(-114.1224, 51.0801), 4326)),
  ('Traffic light out at intersection', 'road', 'in-progress',
   ST_SetSRID(ST_MakePoint(-114.0891, 51.0878), 4326)),

  -- SW fire safety
  ('Fire hydrant needs inspection', 'fire', 'open',
   ST_SetSRID(ST_MakePoint(-114.1084, 51.0334), 4326)),
  ('Smoke detector malfunction', 'fire', 'resolved',
   ST_SetSRID(ST_MakePoint(-114.0932, 51.0412), 4326))
ON CONFLICT DO NOTHING;