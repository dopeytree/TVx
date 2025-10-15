// Client-side logging utility
export const logger = {
  async log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data }),
      });
    } catch (error) {
      // Fallback to console if server logging fails
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  },

  async debug(message: string, data?: any) {
    await this.log('debug', message, data);
  },

  async info(message: string, data?: any) {
    await this.log('info', message, data);
  },

  async warn(message: string, data?: any) {
    await this.log('warn', message, data);
  },

  async error(message: string, data?: any) {
    await this.log('error', message, data);
  },
};