import * as fs from 'fs/promises';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node';
import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

import { repoData, npmData } from './interfaces';

export class npmAnalysis {

    async cloneRepo(url: string, dir: string): Promise<void> {
        try {
            // Check if the directory already exists
            try {
                await fs.access(dir);
                console.log(`Repository already exists in directory: ${dir}`);
                return;
            } catch (err) {
                // Directory does not exist, proceed with cloning
                console.log('Cloning repository...');
                await git.clone({
                    fs,
                    http,
                    dir,
                    url,
                    singleBranch: true,
                });
                console.log('Repository cloned');
            }
        } catch (err) {
            console.error('Error cloning repository:', err);
        }
    }

    async findNumContributors(dir: string): Promise<number> {
        console.log('Finding number of authors...');
        // Iterate over commits and collect author information
        try {
            const commits = await git.log({ fs, dir });
            const contributors = new Set(commits.map((commit) => commit.commit.author.name));
            console.log('Number of authors:', contributors.size);
            return contributors.size;
        } catch (err) {
            console.error('Error finding number of contributors:', err);
            return -1;
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
            numberOfContributors: 0
        };

        await this.cloneRepo(url, repoDir);
        //const numberOfCommits = await this.getCommitHistory(repoDir);
        //repoData.numberOfCommits = numberOfCommits;
        
        // Find number of authors
        npmData.numberOfContributors = await this.findNumContributors(repoDir);
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
    async getOwner(url: string): Promise<string> {
        if (!url) {
            console.error('Invalid URL');
            return "";
        }

        const urlParts = url.split('/');
        if (urlParts.length >= 5) {
            const owner = urlParts[3]; // Extract owner name
            console.log(`Owner parsed from URL: ${owner}`);
            return owner;
        } else {
            console.error('Invalid GitHub repository URL format.');
            return "";
        }
    }

    //parse repo from url
    async getRepo(url: string): Promise<string> {
        if (!url) {
            console.error('Invalid URL');
            return "";
        }

        const urlParts = url.split('/');
        if (urlParts.length >= 5) {
            const repo = urlParts[4]; // Extract repository name
            console.log(`Repository parsed from URL: ${repo}`);
            return repo;
        } else {
            console.error('Invalid GitHub repository URL format.');
            return "";
        }
    }

    //retrieve data by calling correct endpoints
    //retrieve data for open issues
    async fetchOpenIssues(owner: string, repo: string): Promise<any> {
        console.log('Fetching open issues...');
        try {
            const issues = await this.axiosInstance.get(`/repos/${owner}/${repo}`); //get request and await response
            const data = issues.data.open_issues_count; //grab the data
            console.log('Open Issues fetched successfully:', data);
            return data
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve data for closed issues
    async fetchClosedIssues(owner: string, repo: string): Promise<any> {
        console.log('Fetching closed issues...');
        try {
            let page = 1;
            let totalClosedIssues = 0;
            let issues;

            do {
                // Fetch a page of closed issues
                const response = await this.axiosInstance.get(`/repos/${owner}/${repo}/issues`, {
                    params: {
                        state: 'closed',
                        per_page: 100,   // Max per page
                        page: page
                    }
                });

                issues = response.data;
                totalClosedIssues += issues.length;
                page++;
            } while (issues.length > 0); // Continue until no more issues are returned

            console.log('Closed Issues Count fetched successfully:', totalClosedIssues);
            return totalClosedIssues;
        // try {
        //     const response = await this.axiosInstance.get('https://api.github.com/search/issues', {
        //         params: {
        //             q: `repo:${owner}/${repo} state:closed`
        //         }
        //     });

        //     // Extract and return the total count of closed issues
        //     const closedIssuesCount = response.data.total_count;
        //     console.log('Closed Issues Count fetched successfully:', closedIssuesCount);
        //     return closedIssuesCount;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve data for number of contributors
    async fetchContributors(owner: string, repo: string): Promise<any> {
        console.log('Fetching contributors...');
        try {
            // Initialize variables
            let page = 1;
            let contributorsCount = 0;
            let hasMorePages = true;

            // Fetch contributors with pagination
            while (hasMorePages) {
                const response = await this.axiosInstance.get(`/repos/${owner}/${repo}/contributors`, {
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
            return contributorsCount;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve data for time since last commit
    async fetchLastCommit(owner: string, repo: string): Promise<any> {
        console.log('Fetching last commit...');
        try {
            // Fetch the latest commit
            const response = await this.axiosInstance.get(`/repos/${owner}/${repo}/commits`, {
                params: {
                    per_page: 1, // Get only the latest commit
                    page: 1
                }
            });

            // Ensure the response contains data
            if (response.data.length === 0) {
                console.error('No commits found for this repository.');
                return null;
            }

            // Get the timestamp of the most recent commit
            const latestCommitDate = new Date(response.data[0].commit.committer.date);
            const formattedDate = latestCommitDate.toUTCString(); // Format date in UTC format

            console.log('Last commit date:', formattedDate);
            return formattedDate;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve data for liscense
    async fetchLicense(owner: string, repo: string): Promise<any> {
        console.log('Fetching license...');
        try {
            // Fetch license information
            const response = await this.axiosInstance.get(`/repos/${owner}/${repo}/license`);

            // Extract license name
            const licenseName = response.data.license.name;

            console.log('License name:', licenseName);
            return licenseName;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve data for number of commits
    async fetchCommits(owner: string, repo: string): Promise<any> {
        console.log('Fetching commits...');
        try {
            // Initialize count
            let totalCommits = 0;
            let page = 1;
            let hasMoreCommits = true;

            while (hasMoreCommits) {
                const response = await this.axiosInstance.get(`/repos/${owner}/${repo}/commits`, {
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
            console.log('Total number of commits:', totalCommits);
            return totalCommits;
        } catch (error) {
            console.error(error);
        }
    }

    //retrieve total number of lines
    async fetchLines(owner: string, repo: string): Promise<any> {
        console.log('Fetching lines of code...');

        try {
            let totalLines = 0;

            // Fetch the list of files in the root directory
            const response = await this.axiosInstance.get(`/repos/${owner}/${repo}/contents`, {
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
                        return 0;
                    }
                }
                return 0;
            });

            const fileLines = await Promise.all(filePromises);
            totalLines += fileLines.reduce((sum, value) => sum + value, 0);

        console.log('Total lines of code:', totalLines);
        return totalLines;
        } catch (error) {
            console.error(error);
        }
    }

    //return data
    async parseData(data : any) {
        return { //returned the parsed data
            url: data.html_url,
            description: data.description,

            //correctness -> open issues and closed issues
            open_issues: data.open_issues_count,

            //ramp up -> documentation present, lines of code, amount of users using
            subscribers_count: data.subscribers_count,
            network_count: data.network_count,
            size: data.size,

            //responsive manner -> issue resolution time and time since last commit
            created: data.created_at,
            updated: data.updated_at,
            
            //license -> liscense present
            liscense: data.liscense,
            
        };
    }

    async runTasks(url: string): Promise<repoData> {
        let repoData: repoData = {
            repoName: '',
            repoUrl: url,
            repoOwner: '',
            numberOfContributors: 0,
            numberOfOpenIssues: 0,
            numberOfClosedIssues: 0,
            timeSinceLastCommit: '',
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
        const owner = await this.getOwner(url);
        repoData.repoOwner = owner;
        const repo = await this.getRepo(url);
        repoData.repoName = repo;
        //await this.fetchContributors(owner,repo);
        repoData.numberOfContributors = await this.fetchContributors(owner,repo);
        repoData.numberOfOpenIssues = await this.fetchOpenIssues(owner, repo);
        repoData.numberOfClosedIssues = await this.fetchClosedIssues(owner, repo); //CURRENTLY NOT WORKING FOR ONE OF THE URLS or slow
        repoData.timeSinceLastCommit = await this.fetchLastCommit(owner,repo);
        repoData.licenses = await this.fetchLicense(owner, repo); //name not returning specfic license sometimes
        repoData.numberOfCommits = await this.fetchCommits(owner, repo); //slow
        repoData.numberOfLines = await this.fetchLines(owner, repo); //error for some files (currently not printing error)

        console.log('All git tasks completed in order');
        return repoData;
    }
}
