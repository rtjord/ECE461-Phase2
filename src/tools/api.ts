import * as fs from 'fs/promises';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node';
import axios, { AxiosInstance } from 'axios';
import { gitData, npmData } from '../utils/interfaces';
import { logger } from './logging';
import { envVars } from '../utils/interfaces';

export class npmAnalysis {
    private logger: logger;

    constructor(envVars: envVars) {
        this.logger = new logger(envVars);
    }
/*
    private async cloneRepo(url: string, dir: string): Promise<void> {
        try {
            // Check if the directory already exists
            try {
                await fs.access(dir);
                this.logger.logInfo(`Repository already exists in directory: ${dir}`);
                await fs.rm(dir, { recursive: true, force: true });
            } catch (err) {
                // Directory does not exist, no need to delete
                this.logger.logDebug('Directory does not exist, proceeding to clone...');
            }

            // Proceed to clone the repository
            this.logger.logInfo('Cloning repository...');
            await git.clone({
                fs,
                http,
                dir,
                url,
                singleBranch: true,
            });
            this.logger.logInfo('Repository cloned.');
        } catch (err) {
            this.logger.logDebug(`Error cloning repository for ${url} in ${dir}`);
        }
    }
*/
    private async cloneRepo(url: string, dir: string): Promise<void> {
        try {
            try {
                await fs.access(dir);
                this.logger.logInfo(`Repository already exists in directory: ${dir}`);
                return;
            } catch (err) {
                this.logger.logDebug('Directory does not exist, proceeding to clone...');
            }

            this.logger.logInfo('Cloning repository...');
            await git.clone({
                fs,
                http,
                dir,
                url,
                singleBranch: true,
            });
            this.logger.logInfo('Repository cloned.');
        } catch (err) {
            this.logger.logDebug(`Error cloning repository for ${url} in ${dir}`);
        }
    }

    private async getReadmeContent(dir: string, npmData: npmData): Promise<void> {
        try {
            const oid = await git.resolveRef({ fs, dir, ref: 'HEAD' });
            const { tree } = await git.readTree({ fs, dir, oid });
    
            const readmeEntry = tree.find(entry => 
                ['readme.md', 'readme', 'readme.txt', 'readme.rst'].includes(entry.path.toLowerCase())
            );
    
            let readmeContent: string | null = null;
            if (readmeEntry) {
                // Found a README file in the repository
                const readmeBlob = await git.readBlob({ fs, dir, oid: readmeEntry.oid });
                readmeContent = new TextDecoder().decode(readmeBlob.blob);
            } else {
                // No README file found, try to fetch README from the package URL (if applicable)
                this.logger.logInfo('No README file found in the repository tree. Trying to fetch via package URL...');
                const readmeUrl = `${npmData.repoUrl}#readme`; // Construct URL to fetch README
                const response = await fetch(readmeUrl);
    
                if (response.ok) {
                    readmeContent = await response.text();
                } else {
                    this.logger.logDebug(`Could not retrieve README from package URL ${readmeUrl}`);
                }
            }
    
            if (readmeContent) {
                npmData.documentation.hasReadme = true;
                npmData.documentation.numLines = readmeContent.split('\n').length;
                npmData.documentation.hasExamples = /[Ee]xamples/i.test(readmeContent);
                npmData.documentation.hasDocumentation = /[Dd]ocumentation/i.test(readmeContent) || /[Dd]ocs/i.test(readmeContent);
            }
    
        } catch (err) {
            this.logger.logDebug(`Error retrieving the README content for ${npmData.repoUrl}`);
        }
        return;
    } 

    private async lastCommitDate(dir: string, npmData: npmData): Promise<void> {
        this.logger.logDebug('Finding time since last commit...');
        try {
            const commits = await git.log({ fs, dir, depth: 1 });
            const lastCommit = commits[0]; 
        
            if (lastCommit) {
              const lastCommitDate = new Date(lastCommit.commit.author.timestamp * 1000);
              npmData.lastCommitDate = lastCommitDate.toDateString();;
              return;
            } else {
                this.logger.logDebug('No commits found in the repository.');
              return;
            }
          } catch (err) {
            this.logger.logDebug(`Error retrieving the last commit in ${dir} for ${npmData.repoUrl}`);
            return;
          }
    }
    
    private async deleteRepo(dir: string): Promise<void> {
        this.logger.logDebug('Deleting repository...');
        try {
            await fs.rm(dir, { recursive: true, force: true });
            this.logger.logDebug('Repository deleted');
        } catch (err) {
            this.logger.logDebug(`Failed to delete repository in ${dir}:`);
        }
    }

    private async executeTasks(task: (repoDir: string, npmData: npmData) => Promise<void>, repoDir: string, npmData: npmData): Promise<number> {
        const startTime = performance.now();
        await task(repoDir, npmData);
        const endTime = performance.now();
        return endTime - startTime;
    }
    
    // Main function to run the tasks in order
    async runTasks(url: string, dest: number): Promise<npmData> {
        this.logger.logDebug('Running npm tasks...');
        const repoDir = './repoDir'+dest.toString();
        let npmData: npmData = {
            repoUrl: url,
            lastCommitDate: '',
            documentation: {
                hasReadme: false,
                numLines: -1,
                hasExamples: false,
                hasDocumentation: false,
            },
            latency: {
                contributors: -1,
                openIssues: -1,
                closedIssues: -1,
                lastCommitDate: -1,
                licenses: -1,
                numberOfCommits: -1,
                numberOfLines: -1,
                documentation: -1
            }
        };
        await this.cloneRepo(url, repoDir);
        /*
        const [
            lastCommitDateLatency,
            documentationLatency
        ] = await Promise.all([
            this.executeTasks(this.lastCommitDate.bind(this), repoDir, npmData),
            this.executeTasks(this.getReadmeContent.bind(this), repoDir, npmData)
        ]);
        */
        [ npmData.latency.lastCommitDate,
          npmData.latency.documentation
        ] = await Promise.all([
            this.executeTasks(this.lastCommitDate.bind(this), repoDir, npmData),
            this.executeTasks(this.getReadmeContent.bind(this), repoDir, npmData)
        ]);
        this.deleteRepo(repoDir);
    
        this.logger.logInfo('All npm tasks completed in order');
        return npmData;
    }
}

export class gitAnalysis {
    private axiosInstance: AxiosInstance;
    private logger: logger;
    private token: string;
    
    //axios instance using tokens, loglevel, logfile from .env
    constructor(envVars: envVars) {
        this.logger = new logger(envVars);
        this.token = envVars.token;
        this.axiosInstance = axios.create({
            baseURL: 'https://api.github.com',  // Set a base URL for all requests
            timeout: 5000,                      // Set a request timeout (in ms)
            headers: {
                'Content-Type': 'application/json',  // Default content type
                'Accept': 'application/vnd.github.v3+json',  // Custom accept header for GitHub API version
                'Authorization': 'Bearer '+this.token  // Authorization header with token
            }
        });
    }

    async isTokenValid(): Promise<boolean> {
        let isValid = false;
        const response = await this.axiosInstance.get('https://github.com/lodash/lodash');
        response.status === 200 ? isValid = true : isValid = false;
        this.logger.logInfo(`Token is valid: ${isValid}`);
        return isValid;
    }

    async checkConnection(url: string): Promise<boolean> {
        try {
            // Make a simple request to GitHub to check the rate limit endpoint
            const response = await this.axiosInstance.get(url);

            // If the request succeeds, print the rate limit and return true
            this.logger.logInfo('Connection successful: status 200');
            return true;
        } catch (error) {
            // If an error occurs, log it and return false
            this.logger.logDebug('Connection failed', error);
            return false;
        }
    }

    async getOwnerAndRepo(gitData: gitData): Promise<void> {
        this.logger.logDebug('Fetching owner and repo name...');
        if (!gitData.repoUrl) {
            this.logger.logInfo('Invalid URL');
            return;
        }

        const urlParts = gitData.repoUrl.split('/');
        if (urlParts.length >= 5) {
            gitData.repoOwner = urlParts[3]; // Extract owner name
            gitData.repoName = urlParts[4]; // Extract repository name
            return;
        } else {
            this.logger.logDebug(`Invalid GitHub repository URL format: ${gitData.repoUrl}`);
            return;
        }
    }

    async fetchOpenIssues(gitData: gitData): Promise<void> {
        this.logger.logDebug('Fetching open issues...');
        try {
            const issues = await this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}`); //get request and await response
            gitData.numberOfOpenIssues = issues.data.open_issues_count; //grab the data
            this.logger.logDebug('Open Issues fetched successfully');
            return;
        } catch (error) {
            this.logger.logDebug(`Error fetching open issues for ${gitData.repoUrl}`, error);
        }
    }

    //retrieve data for closed issues
    async fetchClosedIssues(gitData: gitData): Promise<void> {
        this.logger.logDebug('Fetching closed issues...');
        try {
            let page = 1;
            let totalClosedIssues = 0;
            let issues;

            do {
                // Fetch a page of closed issues
                const response = await this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/issues`, {
                    params: {
                        state: 'closed',
                        per_page: 100,   // Max per page
                        page: page
                    }
                });

                issues = response.data;
                totalClosedIssues += issues.length;
                page++;
            } while ((gitData.numberOfOpenIssues * 2) >= totalClosedIssues && issues.length > 0); // Continue until open issues is 1/2 of the closed issues or last closed issue

            this.logger.logDebug('Closed Issues Count fetched successfully');
            gitData.numberOfClosedIssues = totalClosedIssues;
            return;
        } catch (error) {
            this.logger.logDebug(`Error fetching closed issues for ${gitData.repoUrl}`, error);
        }
    }

    //retrieve data for number of contributors
    async fetchContributors(gitData: gitData): Promise<void> {
        this.logger.logDebug('Fetching contributors...');
        try {
            // Initialize variables
            let page = 1;
            let contributorsCount = 0;
            let hasMorePages = true;

            // Fetch contributors with pagination
            while (hasMorePages) {
                const response = await this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/contributors`, {
                    params: {
                        per_page: 100,  // Fetch up to 100 contributors per page
                        page: page
                    }
                });

                // Update count and check for more pages
                contributorsCount += response.data.length;
                const linkHeader = response.headers['link'];
                hasMorePages = linkHeader && linkHeader.includes('rel="next"');
                page++;
            }

            this.logger.logDebug('Contributors Count fetched successfully');
            gitData.numberOfContributors = contributorsCount;
            return;
        } catch (error) {
            this.logger.logDebug(`Error fetching number of contributors for ${gitData.repoUrl}`, error);
        }
    }

    //retrieve data for liscense
    async fetchLicense(gitData: gitData): Promise<void> {
        this.logger.logDebug('Fetching license...');
        const approved_license = ['MIT License', 'BSD-3-Clause', 'Apache-2.0', 'LGPL-2.1'];
        try {
            // Fetch license information
            const response = await this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/license`);
            let license = response.data.license.name;
            if (!approved_license.includes(license)) { //Checks if license content has approved licenses
                const licenseContentEncoded = response.data.content; // Extract the license content (base64 encoded)
                const licenseContent = Buffer.from(licenseContentEncoded, 'base64').toString('utf-8'); // Decode the base64 content
                for (let element of approved_license) {
                    if (licenseContent.includes(element)){
                        license = element;
                        break
                    }
                }
            }
            gitData.licenses = license;
            this.logger.logDebug('License fetched successfully');
            return;
        } catch (error) {
            this.logger.logDebug(`Error fetching license for ${gitData.repoUrl}`, error);
        }
    }

    //retrieve data for number of commits
    async fetchCommits(gitData: gitData): Promise<void> {
        this.logger.logDebug('Fetching commits...');
        try {
            // Initialize count
            let totalCommits = 0;
            let page = 1;
            let hasMoreCommits = true;

            while (hasMoreCommits) {
                const response = await this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/commits`, {
                    params: {
                        per_page: 100, // Max number of commits per page
                        page: page
                    }
                });

                // Increment total commits by the number of commits received
                totalCommits += response.data.length;

                // Check if there's more commits to fetch
                hasMoreCommits = response.data.length === 100;
                page++;
            }
            gitData.numberOfCommits = totalCommits;
            this.logger.logDebug('Commits Count fetched successfully');
            return;
        } catch (error) {
            this.logger.logDebug(`Error fetching number of commits for ${gitData.repoUrl}`, error);
        }
    }

    //retrieve total number of lines
    async fetchLines(gitData: gitData): Promise<void> {
        this.logger.logDebug('Fetching lines of code...');

        // Helper for determining if it's a file or directory
        const processDirorFile = async (file: any): Promise<number> => {
            let result = 0;

            if (file.type === 'file') {
                try {
                    const fileResponse = await this.axiosInstance.get(file.download_url);
                    result += fileResponse.data.split('\n').length;
                    return result;
                } catch (error) {
                    // console.error('Error fetching file content:', error);
                    return result;
                }
            } else if (file.type === "dir") {
                try {
                    const directoryResponse = await this.axiosInstance.get(file.url); // Fetch directory contents
                    const directoryFiles = directoryResponse.data;

                    const filePromises = directoryFiles.map(processDirorFile);
                    const fileLines = await Promise.all(filePromises);

                    result += fileLines.reduce((sum, value) => sum + value, 0);
                    return result;
                } catch (error) {
                    console.error('Error fetching directory contents:', error);
                    return result;
                }
            }

            return result; // If not a file or directory
        }
        try {
            let totalLines = 0;

            // Fetch the list of files in the root directory
            const response = await this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/contents`, {
                params: { per_page: 100 } // Adjust as needed
            });

            const files = response.data;

            // Process each file or directory
            const filePromises = files.map(processDirorFile);
            const fileLines = await Promise.all(filePromises);

            // Sum up all the lines of code
            totalLines = fileLines.reduce((sum, value) => sum + value, 0);
            gitData.numberOfLines = totalLines;
            this.logger.logDebug('Lines of code fetched successfully');
            return;
        } catch (error) {
            this.logger.logDebug(`Error fetching number of lines for ${gitData.repoUrl}`, error);
        }
    }

    private async executeTasks(task: (gitData: gitData) => Promise<void>, gitData: gitData): Promise<number> {
        const startTime = performance.now();
        await task(gitData);
        const endTime = performance.now();
        return endTime - startTime;
    }

    async runTasks(url: string): Promise<gitData> {
        this.logger.logDebug('Running git tasks...');
        let gitData: gitData = {
            repoName: '',
            repoUrl: url,
            repoOwner: '',
            numberOfContributors: -1,
            numberOfOpenIssues: -1,
            numberOfClosedIssues: -1,
            licenses: [],
            numberOfCommits: -1,
            numberOfLines: -1,
            latency: {
                contributors: -1,
                openIssues: -1,
                closedIssues: -1,
                lastCommitDate: -1,
                licenses: -1,
                numberOfCommits: -1,
                numberOfLines: -1,
                documentation: -1
            }
        };

        if (await this.checkConnection(url)) {
            await this.getOwnerAndRepo(gitData);
            [ gitData.latency.contributors,
              gitData.latency.openIssues,
              gitData.latency.closedIssues,
              gitData.latency.licenses,
              gitData.latency.numberOfCommits,
              gitData.latency.numberOfLines
            ] = await Promise.all([
                this.executeTasks(this.fetchContributors.bind(this), gitData),
                this.executeTasks(this.fetchOpenIssues.bind(this), gitData),
                this.executeTasks(this.fetchClosedIssues.bind(this), gitData),
                this.executeTasks(this.fetchLicense.bind(this), gitData),
                this.executeTasks(this.fetchCommits.bind(this), gitData),
                this.executeTasks(this.fetchLines.bind(this), gitData)
            ]);

            this.logger.logInfo('All git tasks completed in order');
            return gitData;
        }
        this.logger.logDebug(`No git tasks completed. Invalid URL: ${url}`);
        return gitData;
    }
}
