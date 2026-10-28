import express from 'express';

// The app is built here and started in index.js, so it can be imported without opening a port
export const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
