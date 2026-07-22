const timestamp = (): string => new Date().toISOString();

export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.log(`[${timestamp()}] INFO: ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`[${timestamp()}] WARN: ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]): void => {
    console.error(`[${timestamp()}] ERROR: ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[${timestamp()}] DEBUG: ${message}`, ...args);
    }
  },
};
