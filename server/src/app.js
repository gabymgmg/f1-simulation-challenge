import express from 'express';

// The app is built here and started in index.js, so it can be imported without opening a port
export const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Express recognizes an error middleware by its 4 parameters.
// Errors with a status are expected (400 bad JSON, 404, 503, 504); anything else is our bug.
app.use((error, req, res, next) => {
  const status = error.status || 500;
  if (status === 500) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
  res.status(status).json({ message: error.message });
});
