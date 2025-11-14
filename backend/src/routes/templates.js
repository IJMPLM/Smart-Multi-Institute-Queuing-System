import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesPath = path.join(__dirname, '../../api_object_templates');

// Helper function to read JSON template
const readTemplate = (filename) => {
  try {
    const filePath = path.join(templatesPath, filename);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading template ${filename}:`, error);
    return null;
  }
};

// Queue data endpoint
router.get('/queue', (req, res) => {
  const data = readTemplate('queue_data.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load queue data' });
  }
});

// Devices endpoint
router.get('/devices', (req, res) => {
  const data = readTemplate('devices.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load devices data' });
  }
});

// Sessions endpoint
router.get('/sessions', (req, res) => {
  const data = readTemplate('sessions.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load sessions data' });
  }
});

// Counter dashboard endpoint
router.get('/counter-dashboard', (req, res) => {
  const data = readTemplate('counter_dashboard.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load counter dashboard data' });
  }
});

// Navigation links endpoint
router.get('/nav-links', (req, res) => {
  const data = readTemplate('nav_links.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load navigation links' });
  }
});

// Responses endpoint
router.get('/responses', (req, res) => {
  const data = readTemplate('responses.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load responses data' });
  }
});

// Interactions endpoint
router.get('/interactions', (req, res) => {
  const data = readTemplate('interactions.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load interactions data' });
  }
});

// Form input endpoint
router.get('/form-input', (req, res) => {
  const data = readTemplate('form_input.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load form input data' });
  }
});

// Requirements endpoint
router.get('/requirements', (req, res) => {
  const data = readTemplate('requirements.json');
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: 'Failed to load requirements data' });
  }
});

export default router;