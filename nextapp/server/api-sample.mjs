import express from 'express';
import cors from 'cors';

const app = express();
const port = 4000;

// Enable CORS for Next.js frontend
app.use(cors());

// Sample issues data
const issues = [
  {
    id: '1',
    title: 'Downtown Pothole',
    description: 'Large pothole needs immediate repair',
    location: {
      lat: 51.0447,
      lng: -114.0719
    },
    status: 'open',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Park Lighting Issue',
    description: 'Several street lights not working in community park',
    location: {
      lat: 51.0540,
      lng: -114.0645
    },
    status: 'in-progress',
    createdAt: new Date().toISOString()
  }
];

// GET /api/issues endpoint
app.get('/api/issues', (req, res) => {
  res.json(issues);
});

app.listen(port, () => {
  console.log(`Mock API running at http://localhost:${port}`);
});