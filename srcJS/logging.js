"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LogLevel = void 0;
const fs = __importStar(require("fs"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["SILENT"] = 0] = "SILENT";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 2] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class logger {
    constructor(envVars) {
        this.redColor = '\x1b[31m';
        this.resetColor = '\x1b[0m';
        this.logLevel = envVars.logLevel;
        this.logFile = envVars.logPath;
    }
    logMessage(level, message) {
        if (level <= this.logLevel) {
            const logEntry = `${new Date().toISOString()} - ${LogLevel[level]} - ${message}`;
            if (level === LogLevel.DEBUG) {
                this.writeDebugLog(logEntry);
            }
            else {
                this.writeLog(logEntry);
            }
        }
        return;
    }
    writeLog(message) {
        fs.appendFileSync(this.logFile, message + '\n', 'utf8'); //Makes sures nothing is overwritten
    }
    writeDebugLog(message) {
        fs.appendFileSync(this.logFile, this.redColor + message + this.resetColor + '\n', 'utf8');
    }
}
exports.logger = logger;
