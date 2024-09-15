import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';  // For running shell commands

export enum LogLevel {
    CRITICAL = 0,
    ERROR = 1,
    WARNING = 2,
    INFO = 3,
    DEBUG = 4
}

// LogQueue to handle verbose logging during transactions
export class LogQueue {
    private logBuffer: string[] = [];
    
    log(message: string) {
        this.logBuffer.push(message);
    }

    flushToFile(logFilePath: string) {
        fs.appendFileSync(logFilePath, this.logBuffer.join('\n') + '\n', 'utf8');
        this.clear();
    }

    clear() {
        this.logBuffer = [];
    }
}

// Write a log message to the log file
export function writeLog(logFilePath: string, message: string) {
    fs.appendFileSync(logFilePath, message + '\n', 'utf8'); //Makes sures nothing is overwritten
}

// Get log level from environment variables or default to CRITICAL
export function getLogLevel(): LogLevel {
    const logLevelEnv = process.env.LOG_LEVEL || '0'; // Default to '0'
    const logLevel = parseInt(logLevelEnv, 10);
    return isNaN(logLevel) ? LogLevel.CRITICAL : logLevel;
}

// Get log file path from environment variables
export function getLogFile(): string {
    const logFileEnv = process.env.LOG_FILE || 'default_log_file.log'; // Default to 'default_log_file.log'
    return path.resolve(logFileEnv);  // Ensure an absolute path
}

// Logging with different levels and messages
export function logMessage(level: LogLevel, message: string, currentLogLevel: LogLevel, logFile: string) {
    if (level <= currentLogLevel) {
        const logEntry = `${new Date().toISOString()} - ${LogLevel[level]} - ${message}`;
        writeLog(logFile, logEntry);

        // Log to console in development/debug
        if (currentLogLevel === LogLevel.DEBUG) {
            console.log(logEntry);
        }
    }
}

// Clone a repository and log the result
export function cloneRepository(repoUrl: string, destination: string, logFile: string, logLevel: LogLevel) {
    try {
        logMessage(LogLevel.INFO, `Cloning repository from ${repoUrl}`, logLevel, logFile);
        execSync(`git clone ${repoUrl} ${destination}`);
        logMessage(LogLevel.INFO, `Repository cloned successfully to ${destination}`, logLevel, logFile);
    } catch (error) {
        logMessage(LogLevel.ERROR, `Failed to clone repository: ${error}`, logLevel, logFile);
    }
}

// Delete a repository folder and log the result
export function deleteRepository(destination: string, logFile: string, logLevel: LogLevel) {
    try {
        logMessage(LogLevel.INFO, `Deleting repository at ${destination}`, logLevel, logFile);
        execSync(`rm -rf ${destination}`); // Use `rm -rf` to remove the folder
        logMessage(LogLevel.INFO, `Repository deleted successfully at ${destination}`, logLevel, logFile);
    } catch (error) {
        logMessage(LogLevel.ERROR, `Failed to delete repository: ${error}`, logLevel, logFile);
    }
}

// Example of using a log queue for temporary logging during transactions
export function processTransaction(logQueue: LogQueue, logFile: string, logLevel: LogLevel) {
    // Temporary verbose logging in memory
    logQueue.log('Transaction started');
    logQueue.log('Performing step 1...');
    logQueue.log('Performing step 2...');
    
    const transactionSuccess = Math.random() > 0.5; // Simulate random success/failure

    if (transactionSuccess) {
        logMessage(LogLevel.INFO, 'Transaction completed successfully', logLevel, logFile);
        logQueue.clear(); // Clear temporary logs on success
    } else {
        logMessage(LogLevel.ERROR, 'Transaction failed', logLevel, logFile);
        logQueue.flushToFile(logFile); // Flush logs to file on failure
    }
}

//************************************************************************************************************************************************************* */
//How to use the logger through importing:
//import { cloneRepository, deleteRepository, getLogFile, getLogLevel, LogLevel, writeLog } from './logging';  // Adjust the path based on your file structure
//************************************************************************************************************************************************************* */
