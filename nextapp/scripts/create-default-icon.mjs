import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a 22x22 canvas (11px icon with 1px padding)
const canvas = createCanvas(22, 22);
const ctx = canvas.getContext('2d');

// Draw a white-bordered black circle
ctx.beginPath();
ctx.arc(11, 11, 8, 0, Math.PI * 2);
ctx.fillStyle = '#000000';
ctx.fill();
ctx.strokeStyle = '#FFFFFF';
ctx.lineWidth = 2;
ctx.stroke();

// Save the PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '../public/icons/default.png'), buffer);