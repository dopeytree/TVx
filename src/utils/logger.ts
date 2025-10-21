// Client-side log buffering and throttling
const LOG_BUFFER: Array<{ level: string; message: string; timestamp: number }> = [];
const BUFFER_FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BUFFER_SIZE = 50; // Max logs before forcing a flush
let flushTimeout: NodeJS.Timeout | null = null;

// Only send important logs to server (errors and warnings)
const SEND_LEVELS = new Set(['error', 'warn']);

const flushLogs = async () => {
  if (LOG_BUFFER.length === 0) return;

  const logsToSend = LOG_BUFFER.splice(0, LOG_BUFFER.length);
  
  try {
    await fetch('/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        logs: logsToSend,
        userAgent: navigator.userAgent 
      }),
      // Don't wait for response - fire and forget
      keepalive: true
    });
  } catch (error) {
    // Silent fail - logs are already in console
  }
};

const scheduleFlush = () => {
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushLogs, BUFFER_FLUSH_INTERVAL);
};

const sendLog = (level: string, message: string) => {
  // Only send errors and warnings to server
  if (!SEND_LEVELS.has(level)) return;

  LOG_BUFFER.push({
    level,
    message,
    timestamp: Date.now()
  });

  // Force flush if buffer is full
  if (LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
    if (flushTimeout) clearTimeout(flushTimeout);
    flushLogs();
  } else {
    scheduleFlush();
  }
};

// Flush logs before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (LOG_BUFFER.length > 0) {
      navigator.sendBeacon?.('/log', JSON.stringify({ 
        logs: LOG_BUFFER,
        userAgent: navigator.userAgent 
      }));
    }
  });
}

export const logger = {
  log: (message: string) => {
    console.log(message);
    // Don't send info logs to server for home use
  },
  error: (message: string) => {
    console.error(message);
    sendLog('error', message);
  },
  warn: (message: string) => {
    console.warn(message);
    sendLog('warn', message);
  },
  info: (message: string) => {
    console.info(message);
    // Don't send info logs to server for home use
  },
};