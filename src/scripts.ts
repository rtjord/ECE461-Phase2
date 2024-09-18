import dotenv from 'dotenv';
import { urlAnalysis } from './urlOps';
import { repoData } from './utils/interfaces';
import { gitAnalysis, npmAnalysis } from './api';
import * as fs from 'fs';
import * as readline from 'readline';

export class runAnalysis {
    private npmAnalysis: npmAnalysis;
    private gitAnalysis: gitAnalysis;
    private urlAnalysis: urlAnalysis;
    private token: string;

    constructor(token: string) {
        if (!token) {
            console.error('No token provided');
            process.exit(1);
        }
        this.token = token;
        this.npmAnalysis = new npmAnalysis();
        this.gitAnalysis = new gitAnalysis(token);
        this.urlAnalysis = new urlAnalysis();
    }

    // Function to read the file and store URLs in an array
    async parseURLsToArray(filePath: string): Promise<string[]> {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
        });
    
        const urlArray: string[] = []; // Array to store URLs
    
        // Process each line (URL) in the file
        for await (const line of rl) {
        urlArray.push(line); // Add the URL to the array
        }
    
        return urlArray;
    }

    async runAnalysis(urls: string[]): Promise<repoData[]> {
        if (!this.token) {
            //log error
            console.error('No token provided');
            process.exit(1);
        }
        // call gitAnalysis and check if the token is valid
            // CHECK HERE using this.gitAnalysis.blahblah()
        
        const repoDataPromises = urls.map((url, index) => this.evaluateMods(url, index));
        // Use Promise.all to wait for all promises to resolve in parallel
        const repoDataArr = await Promise.all(repoDataPromises);
        for (const repo of repoDataArr) {
            console.log(repo);
        }
        return repoDataArr;
    }

    async evaluateMods(url: string, index: number): Promise<repoData> {
        const [type, cleanedUrl] = await this.urlAnalysis.evalUrl(url);
        console.log('Type:', type, 'Cleaned URL:', cleanedUrl);
        let repoData: repoData = {
            repoName: '',
            repoUrl: url,
            repoOwner: '',
            numberOfContributors: -1,
            numberOfOpenIssues: -1,
            numberOfClosedIssues: -1,
            lastCommitDate: '',
            licenses: [],
            numberOfCommits: -1,
            numberOfLines: -1,
            documentation: {
                hasReadme: false,
                numLines: -1,
                hasToc: false,
                hasInstallation: false,
                hasUsage: false,
                hasExamples: false,
                hasDocumentation: false
            }
        };
        if (type === -1 || cleanedUrl === '') {
            //log error
            console.error('Invalid URL:', url);
            return repoData;
        }
        /*
        const npmDataPromise = this.npmAnalysis.runTasks(cleanedUrl, index);
        const gitDataPromise = this.gitAnalysis.runTasks(cleanedUrl);
        
        const [npmData, gitData] = await Promise.all([npmDataPromise, gitDataPromise]);
        */
        const [npmData, gitData] = await Promise.all([
            await this.npmAnalysis.runTasks(cleanedUrl, index),
            await this.gitAnalysis.runTasks(cleanedUrl)
        ]);


        repoData = {
            repoName: gitData.repoName,
            repoUrl: cleanedUrl,
            repoOwner: gitData.repoOwner,
            numberOfContributors: gitData.numberOfContributors,
            numberOfOpenIssues: gitData.numberOfOpenIssues,
            numberOfClosedIssues: gitData.numberOfClosedIssues,
            lastCommitDate: npmData.lastCommitDate,
            licenses: gitData.licenses,
            numberOfCommits: gitData.numberOfCommits,
            numberOfLines: gitData.numberOfLines,
            documentation: {
                hasReadme: npmData.documentation.hasReadme,
                numLines: npmData.documentation.numLines,
                hasToc: npmData.documentation.hasToc,
                hasInstallation: npmData.documentation.hasInstallation,
                hasUsage: npmData.documentation.hasUsage,
                hasExamples: npmData.documentation.hasExamples,
                hasDocumentation: npmData.documentation.hasDocumentation
            }
        };

        return repoData;
    }
}

dotenv.config({ path: '../.env' });

const token = process.env.GITHUB_TOKEN;
if (!token) {
    console.error('GitHub token is not defined in environment variables');
    process.exit(1);
}

//console.log(token);

const runAnalysisClass = new runAnalysis(token);
const fileName = process.argv[2]

runAnalysisClass.parseURLsToArray(fileName)
  .then(urlArray => {
    //console.log(urlArray);
    runAnalysisClass.runAnalysis(urlArray);
  })
  .catch(console.error);