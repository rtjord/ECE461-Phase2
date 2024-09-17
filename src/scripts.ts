import { urlAnalysis } from './urlOps';
import { repoData, npmData } from './interfaces';
import { gitAnalysis, npmAnalysis } from './api';

export class runAnalysis {
    private npmAnalysis: npmAnalysis;
    private gitAnalysis: gitAnalysis;
    private urlAnalysis: urlAnalysis;

    constructor() {
        this.npmAnalysis = new npmAnalysis();
        this.gitAnalysis = new gitAnalysis();
        this.urlAnalysis = new urlAnalysis();
    }

    async runAnalysis(urls: string[], token: string): Promise<repoData[]> {
        if (!token) {
            //log error
            console.error('No token provided');
            process.exit(1);
        }
        // call gitAnalysis and check if the token is valid
            // CHECK HERE using this.gitAnalysis.blahblah()
        
        const repoDataPromises = urls.map(url => this.evaluateMods(url, token));
        // Use Promise.all to wait for all promises to resolve in parallel
        const repoDataArr = await Promise.all(repoDataPromises);
        for (const repo of repoDataArr) {
            console.log(repo);
        }
        return repoDataArr;
    }

    async evaluateMods(url: string, token: string): Promise<repoData> {
        const [type, cleanedUrl] = await this.urlAnalysis.evalUrl(url);
        console.log('Type:', type, 'Cleaned URL:', cleanedUrl);
        if (type === -1) {
            //log error
            console.error('Invalid URL:', url);
            const repoData: repoData = {
                repoName: '',
                repoUrl: url,
                repoOwner: '',
                numberOfContributors: -1,
                numberOfOpenIssues: -1,
                numberOfClosedIssues: -1,
                timeSinceLastCommit: '',
                licenses: [],
                numberOfCommits: -1,
                numberOfLines: -1
            };
            return repoData;
        }
        //const gitData = await this.gitAnalysis.runTasks(cleanedUrl, token);
        //const npmData = await this.npmAnalysis.runTasks(cleanedUrl);
        const [npmData, gitData] = await Promise.all([
            await this.npmAnalysis.runTasks(cleanedUrl),
            await this.gitAnalysis.runTasks(cleanedUrl, token)
        ]);

        const repoData: repoData = {
            repoName: gitData.repoName,
            repoUrl: cleanedUrl,
            repoOwner: gitData.repoOwner,
            numberOfContributors: npmData.numberOfContributors,
            numberOfOpenIssues: gitData.numberOfOpenIssues,
            numberOfClosedIssues: gitData.numberOfClosedIssues,
            timeSinceLastCommit: gitData.timeSinceLastCommit,
            licenses: gitData.licenses,
            numberOfCommits: gitData.numberOfCommits,
            numberOfLines: gitData.numberOfLines
        };

        return repoData;
    }
}

const exFileLog = [
    "https://github.com/nullivex/nodist",
    //"https://www.npmjs.com/package/express",
    //"https://github.com/lodash/lodash",
    //"https://www.npmjs.com/package/browserify",
];

const runAnalysisClass = new runAnalysis();
runAnalysisClass.runAnalysis(exFileLog, 'GITHUB_TOKEN');
