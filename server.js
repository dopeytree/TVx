import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;
const CONFIG_DIR = process.env.CONFIG_DIR || '/tmp/config';
const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.json');
const LOG_FILE = path.join(CONFIG_DIR, 'tvx.log');

// Logging function
async function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ` | ${JSON.stringify(data)}` : ''}`;

  // Console logging
  console.log(logEntry);

  // File logging
  try {
    await fs.appendFile(LOG_FILE, logEntry + '\n');
  } catch (error) {
    console.error('Failed to write to log file:', error.message);
  }
}

// Security: Validate config directory path
if (!CONFIG_DIR.startsWith('/') || CONFIG_DIR.includes('..')) {
  console.error('Invalid CONFIG_DIR path:', CONFIG_DIR);
  process.exit(1);
}

// Middleware
app.use(express.json({ limit: '1mb' })); // Limit request size

// Request logging middleware
app.use(async (req, res, next) => {
  const start = Date.now();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';

  // Log incoming request
  await log('info', `Request: ${req.method} ${req.path}`, { ip, userAgent: req.get('User-Agent') });

  // Log response
  const originalSend = res.send;
  res.send = async function(data) {
    const duration = Date.now() - start;
    await log('info', `Response: ${req.method} ${req.path} ${res.statusCode}`, { duration: `${duration}ms` });
    originalSend.call(this, data);
  };

  next();
});

app.use(express.static(path.join(__dirname, 'dist')));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Ensure config directory exists
async function ensureConfigDir() {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o755 });
    await log('info', 'Created config directory', { path: CONFIG_DIR });
  }
}

// Input validation for settings
function validateSettings(settings) {
  if (typeof settings !== 'object' || settings === null) {
    return false;
  }

  // Basic validation - ensure it's a plain object with expected structure
  const allowedKeys = [
    'm3uUrl', 'xmltvUrl', 'autoLoad', 'showNotifications', 'videoQuality',
    'vintageTV', 'vignetteStrength', 'rgbShiftStrength', 'vignetteRadius',
    'edgeAberration', 'frameEdgeBlur', 'centerSharpness', 'sharpenFirst',
    'showLoadingVideo', 'clockStyle', 'panelStyle'
  ];

  for (const key in settings) {
    if (!allowedKeys.includes(key)) {
      console.warn(`Unknown setting key: ${key}`);
      delete settings[key]; // Remove unknown keys
    }
  }

  return true;
}

// API Routes
app.get('/api/settings', async (req, res) => {
  try {
    await ensureConfigDir();
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);

    if (!validateSettings(settings)) {
      await log('error', 'Invalid settings data in file');
      return res.status(500).json({ error: 'Invalid settings data' });
    }

    await log('info', 'Settings loaded successfully');
    res.json(settings);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty object
      await log('info', 'Settings file does not exist, returning defaults');
      res.json({});
    } else {
      await log('error', 'Failed to read settings', { error: error.message });
      res.status(500).json({ error: 'Failed to read settings' });
    }
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body;

    if (!validateSettings(settings)) {
      await log('warn', 'Invalid settings data received', { settings });
      return res.status(400).json({ error: 'Invalid settings data' });
    }

    await ensureConfigDir();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), { mode: 0o644 });

    await log('info', 'Settings saved successfully', { keys: Object.keys(settings) });
    res.json({ success: true });
  } catch (error) {
    await log('error', 'Failed to save settings', { error: error.message });
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Client-side logging endpoint
app.post('/api/log', async (req, res) => {
  try {
    const { level = 'info', message, data } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Validate log level
    const validLevels = ['debug', 'info', 'warn', 'error'];
    const logLevel = validLevels.includes(level) ? level : 'info';

    await log(logLevel, `CLIENT: ${message}`, data);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to log client message:', error);
    res.status(500).json({ error: 'Failed to log message' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    configDir: CONFIG_DIR
  };

  await log('info', 'Health check requested');
  res.json(health);
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use(async (err, req, res, next) => {
  await log('error', 'Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', async () => {
  await log('info', 'TVx server started', { port: PORT, configDir: CONFIG_DIR, logFile: LOG_FILE });
  console.log(`TVx server running on port ${PORT}`);
  console.log(`Config directory: ${CONFIG_DIR}`);
  console.log(`Log file: ${LOG_FILE}`);
  console.log('Server configured with basic security measures and logging');
});