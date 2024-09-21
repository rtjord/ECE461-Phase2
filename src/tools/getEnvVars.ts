import dotenv from 'dotenv';

export class getEnvVars {
    public logLevel: number;
    public logFilePath: string;
    public token: string;

    constructor() {
        dotenv.config({ path: '../.env' });
        const token = process.env.GITHUB_TOKEN;
        if (token === undefined) {
            console.error('GitHub token is not defined in environment variables');
            process.exit(1);
        }
        this.token = token;
        this.logLevel = Number(process.env.LOG_LEVEL);
        const logFilePath = process.env.LOG_FILE;
        if (logFilePath === undefined) {
            console.error('Log path is not defined in environment variables');
            process.exit(1);
        }
        this.logFilePath = logFilePath;
    }
}
