import express from 'express';
import { getRaces, getRace, getTyres } from './f1Client.js';

// Errors thrown here (f1Client ones carry a status) reach the error middleware in app.js
export const router = express.Router();

router.get('/races', async (req, res) => {
  res.json(await getRaces());
});

// Returns the race with its circuit embedded
router.get('/races/:raceId', async (req, res) => {
  res.json(await getRace(req.params.raceId));
});

router.get('/tyres', async (req, res) => {
  res.json(await getTyres());
});
