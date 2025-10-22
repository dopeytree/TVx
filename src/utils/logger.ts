// Client-side logging - send all logs to server for visibility
const sendLog = async (level: string, message: string) => {
  try {
    await fetch('/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level, message }),
    });
  } catch (error) {
    // Fallback to console if fetch fails - silent fail to avoid log loops
  }
};

export const logger = {
  log: (message: string) => {
    console.log(message);
    sendLog('info', message);
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
    sendLog('info', message);
  },
};