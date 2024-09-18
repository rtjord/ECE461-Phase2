import * as fs from 'fs/promises';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node';
import axios, { AxiosInstance } from 'axios';
import { gitData, npmData } from '../utils/interfaces';

export class npmAnalysis {
    async cloneRepo(url: string, dir: string): Promise<void> {
        try {
            // Check if the directory already exists
            try {
                await fs.access(dir);
                console.log(`Repository already exists in directory: ${dir}`);

                // If the repository exists, delete it
                console.log('Deleting existing repository...');
                await fs.rm(dir, { recursive: true, force: true });
                console.log('Repository deleted.');
            } catch (err) {
                // Directory does not exist, no need to delete
                console.log('Directory does not exist, proceeding to clone...');
            }

            // Proceed to clone the repository
            console.log('Cloning repository...');
            await git.clone({
                fs,
                http,
                dir,
                url,
                singleBranch: true,
            });
            console.log('Repository cloned.');
        } catch (err) {
            console.error('Error cloning repository:', err);
        }
    }

    async getReadmeContent(dir: string, npmData: npmData): Promise<void> {
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
                console.log('No README file found in the repository tree. Trying to fetch via package URL...');
                const readmeUrl = `${npmData.repoUrl}#readme`; // Construct URL to fetch README
                const response = await fetch(readmeUrl);
    
                if (response.ok) {
                    readmeContent = await response.text();
                } else {
                    console.log('Could not retrieve README from package URL:', readmeUrl);
                }
            }
    
            if (readmeContent) {
                npmData.documentation.hasReadme = true;
                npmData.documentation.numLines = readmeContent.split('\n').length;
                npmData.documentation.hasToc = /[Tt]able of [Cc]ontents/i.test(readmeContent);
                npmData.documentation.hasInstallation = /[Ii]nstall/i.test(readmeContent);
                npmData.documentation.hasUsage = /[Uu]sage/i.test(readmeContent);
                npmData.documentation.hasExamples = /[Ee]xamples/i.test(readmeContent);
                npmData.documentation.hasDocumentation = /[Dd]ocumentation/i.test(readmeContent) || /[Dd]ocs/i.test(readmeContent);
            }
    
        } catch (err) {
            console.error('Error retrieving the README content:', err);
        }
        return;
    } 

    async lastCommitDate(dir: string, npmData: npmData): Promise<void> {
        console.log('Finding time since last commit...');
        try {
            const commits = await git.log({ fs, dir, depth: 1 });
            const lastCommit = commits[0]; 
        
            if (lastCommit) {
              const lastCommitDate = new Date(lastCommit.commit.author.timestamp * 1000);
              npmData.lastCommitDate = lastCommitDate.toDateString();;
              return;
            } else {
              console.log('No commits found in the repository.');
              return;
            }
          } catch (err) {
            console.error('Error retrieving the last commit:', err);
            return;
          }
    }
    
    async deleteRepo(dir: string): Promise<void> {
        console.log('Deleting repository...');
        try {
            await fs.rm(dir, { recursive: true, force: true });
            console.log('Repository deleted');
        } catch (err) {
            console.error('Failed to delete repository:', err);
        }
    }
    
    // Main function to run the tasks in order
    async runTasks(url: string, dest: number): Promise<npmData> {
        const repoDir = './repoDir'+dest.toString();
        let npmData: npmData = {
            repoUrl: url,
            lastCommitDate: '',
            documentation: {
                hasReadme: false,
                numLines: -1,
                hasToc: false,
                hasInstallation: false,
                hasUsage: false,
                hasExamples: false,
                hasDocumentation: false,
            }
        };

        await this.cloneRepo(url, repoDir);
        await this.lastCommitDate(repoDir, npmData);
        await this.getReadmeContent(repoDir, npmData);
        await this.deleteRepo(repoDir);
    
        console.log('All npm tasks completed in order');
        return npmData;
    }
}

export class gitAnalysis {
    private axiosInstance: AxiosInstance;
    private token: string;
    
    //axios instance using tokens, loglevel, logfile from keys.n
    constructor(token: string) {
        this.token = token;
        this.axiosInstance = axios.create({
            baseURL: 'https://api.github.com',  // Set a base URL for all requests
            timeout: 5000,                      // Set a request timeout (in ms)
            headers: {
                'Content-Type': 'application/json',  // Default content type
                'Accept': 'application/vnd.github.v3+json',  // Custom accept header for GitHub API version
                'Authorization': 'Bearer '+token  // Authorization header with token
            }
        });
    }

    async isTokenValid(): Promise<boolean> {
        let isValid = false;
        const response = await this.axiosInstance.get('https://github.com/lodash/lodash');
        response.status === 200 ? isValid = true : isValid = false;
        return isValid;
    }

    
    //make sure of connection
    async checkConnection(url: string): Promise<boolean> {
        try {
            // Make a simple request to GitHub to check the rate limit endpoint
            const response = await this.axiosInstance.get(url);

            // If the request succeeds, print the rate limit and return true
            console.log('Connection successful:', response.status);
            return true;
        } catch (error) {
            // If an error occurs, log it and return false
            console.error('Connection failed:', error);
            return false;
        }
    }

    //parse owner from url
    async getOwnerAndRepo(gitData: gitData): Promise<void> {
        if (!gitData.repoUrl) {
            console.error('Invalid URL');
            return;
        }

        const urlParts = gitData.repoUrl.split('/');
        if (urlParts.length >= 5) {
            gitData.repoOwner = urlParts[3]; // Extract owner name
            console.log(`Owner parsed from URL: ${gitData.repoOwner}`);
            gitData.repoName = urlParts[4]; // Extract repository name
            console.log(`Repository parsed from URL: ${gitData.repoName}`);
            return;
        } else {
            console.error('Invalid GitHub repository URL format.');
            return;
        }
    }

    //retrieve data by calling correct endpoints
    //retrieve data for open issues
    async fetchOpenIssues(gitData: gitData): Promise<void> {
        console.log('Fetching open issues...');
        try {
            const issues = await this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}`); //get request and await response
            gitData.numberOfOpenIssues = issues.data.open_issues_count; //grab the data
            console.log('Open Issues fetched successfully:', gitData.numberOfOpenIssues);
            return;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve data for closed issues
    async fetchClosedIssues(gitData: gitData): Promise<void> {
        console.log('Fetching closed issues...');
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

            console.log('Closed Issues Count fetched successfully:', totalClosedIssues);
            gitData.numberOfClosedIssues = totalClosedIssues;
            return;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve data for number of contributors
    async fetchContributors(gitData: gitData): Promise<void> {
        console.log('Fetching contributors...');
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

            console.log('Contributors Count fetched successfully:', contributorsCount);
            gitData.numberOfContributors = contributorsCount;
            return;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve data for liscense
    async fetchLicense(gitData: gitData): Promise<void> {
        console.log('Fetching license...');
        try {
            // Fetch license information
            const response = await this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/license`);
            gitData.licenses = response.data.license.name;
            console.log('License name:', gitData.licenses);
            return;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve data for number of commits
    async fetchCommits(gitData: gitData): Promise<void> {
        console.log('Fetching commits...');
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
            console.log('Total number of commits:', gitData.numberOfCommits);
            return;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve total number of lines
    async fetchLines(gitData: gitData): Promise<void> {
        console.log('Fetching lines of code...');

        try {
            let totalLines = 0;

            // Fetch the list of files in the root directory
            const response = await this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/contents`, {
                params: { per_page: 100 } // Adjust as needed
            });

            const files = response.data;

            // Process each file
            const filePromises = files.map(async (file: any) => {
                if (file.type === 'file') {
                    try {
                        const fileResponse = await axios.get(file.download_url);
                        return fileResponse.data.split('\n').length;
                    } catch (error) {
                        // console.error('Error fetching file content:', error);
                        return;
                    }
                }
                return;
            });

            const fileLines = await Promise.all(filePromises);
            totalLines += fileLines.reduce((sum, value) => sum + value, 0);
            gitData.numberOfLines = totalLines;
            console.log('Total lines of code:', gitData.numberOfLines);
            return;
        } catch (error) {
            console.error(error);
        }
    }

    async runTasks(url: string): Promise<gitData> {
        let gitData: gitData = {
            repoName: '',
            repoUrl: url,
            repoOwner: '',
            numberOfContributors: 0,
            numberOfOpenIssues: 0,
            numberOfClosedIssues: 0,
            licenses: [],
            numberOfCommits: 0,
            numberOfLines: 0
        };
        // Create an axios instance
            /*
            Might be worth adding a funciton that handles all get request to
            the Github API that takes in the parameter of the endpoint and 
            returns whatever is needed.
            */
        // Run each function sequentially
        await this.checkConnection(url);
        await this.getOwnerAndRepo(gitData);
        await this.fetchContributors(gitData);
        await this.fetchOpenIssues(gitData);
        await this.fetchClosedIssues(gitData); //CURRENTLY NOT WORKING FOR ONE OF THE URLS or slow
        //await this.fetchLastCommit(owner,repo);
        await this.fetchLicense(gitData); //take another way
        await this.fetchCommits(gitData); //slow
        await this.fetchLines(gitData); //error for some files (currently not printing error)

        console.log('All git tasks completed in order');
        return gitData;
    }
}
