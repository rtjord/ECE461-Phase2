import dotenv from 'dotenv';

export class envVars {
    public logLevel: number;
    public logPath: string;
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
        const logPath = process.env.LOG_PATH;
        if (logPath === undefined) {
            console.error('Log path is not defined in environment variables');
            process.exit(1);
        }
        this.logPath = logPath;
    }
}
