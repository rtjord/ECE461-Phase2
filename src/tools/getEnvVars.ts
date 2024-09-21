import dotenv from 'dotenv';
import { logger } from './logging';

export class getEnvVars {
    public logLevel: number;
    public logFilePath: string;
    public token: string;

    constructor() {
        dotenv.config({ path: '../.env' });
        const token = process.env.GITHUB_TOKEN;
        if (token === undefined) {
            process.exit(1);
        }
        this.token = token;
        this.logLevel = Number(process.env.LOG_LEVEL);
        const logFilePath = process.env.LOG_FILE;
        if (logFilePath === undefined) {
            process.exit(1);
        }
        this.logFilePath = logFilePath;
    }
}
