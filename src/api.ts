import * as fs from 'fs/promises';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node';
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
/*
    async getCommitHistory(dir: string): Promise<number> {
        console.log('Fetching commit history...');
        try {
            const commits = await git.log({ fs, dir });
            console.log('Last Commit:', commits[0]);
            console.log('Number of commits:', commits.length);
            return commits.length;
        } catch (err) {
            console.error('Error fetching commit history:', err);
            return -1;
        }
    }
*/
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
    async runTasks(url: string): Promise<npmData> {
        const repoDir = './repoDir';
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
    // Create axios instance
    // make sure of connection
    // retrieve data by calling correct endpoints
    // return data
    async runTasks(url: string, token: string): Promise<repoData> {
        const repoDir = './repoDir';
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
        console.log('All git tasks completed in order');
        return repoData;
    }
}