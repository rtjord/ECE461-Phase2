import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
    SILENT = 0,
    INFO = 1,
    DEBUG = 2
}

export class logger {
    private logLevel: number;
    private logFile: string;
    private redColor = '\x1b[31m';
    private resetColor = '\x1b[0m';

    constructor(envVars: envVars) {
        this.logLevel = envVars.logLevel;
        this.logFile = envVars.logPath;
    }

    logMessage(level: LogLevel, message: string) {
        if (level <= this.logLevel) {
            const logEntry = `${new Date().toISOString()} - ${LogLevel[level]} - ${message}`;
            if (level === LogLevel.DEBUG) { this.writeDebugLog(logEntry); }
            else { this.writeLog(logEntry); }
        }
        return;
    }

    writeLog(message: string) {
        fs.appendFileSync(this.logFile, message + '\n', 'utf8'); //Makes sures nothing is overwritten
    }

    writeDebugLog(message: string) {
        fs.appendFileSync(this.logFile, this.redColor + message + this.resetColor + '\n', 'utf8');
    }
}
