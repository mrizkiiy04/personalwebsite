import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Memory usage monitoring endpoint
app.get('/server-status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.json({
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`, // Resident Set Size
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`, // Total Size of the Heap
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`, // Heap actually Used
    external: `${Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100} MB`, // External memory
    uptime: `${Math.floor(process.uptime())} seconds`
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Log initial memory usage
  const memoryUsage = process.memoryUsage();
  console.log('Initial memory usage:');
  console.log(`RSS: ${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB`);
  console.log(`Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`);
  console.log(`Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`);
}); 