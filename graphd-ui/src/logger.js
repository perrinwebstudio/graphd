import config from './graphdConfig.js';

class Logger {
    constructor(level = 'info') {
        this.levels = ['error', 'warn', 'info', 'debug'];
        this.level = level.toLowerCase();
    }

    setLevel(level) {
        if (this.levels.includes(level?.toLowerCase())) {
            this.level = level.toLowerCase();
        } else {
            throw new Error(`Invalid log level: ${level}`);
        }
    }

    log(level, ...args) {
        if (this.levels.indexOf(level) <= this.levels.indexOf(this.level)) {
            console.log(`[${level.toUpperCase()}]`, ...args);
        }
    }

    error(...args) {
        const error = args.find(arg => arg instanceof Error);
        if (error) {
            console.error(`[ERROR]`, error.stack);
        } else {
            this.log('error', ...args);
        }
    }

    warn(...args) {
        this.log('warn', ...args);
    }

    info(...args) {
        this.log('info', ...args);
    }

    debug(...args) {
        this.log('debug', ...args);
    }
}

const logger = new Logger(config.logLevel || 'info');

export { logger, Logger };
