import * as fs from 'fs/promises';
import * as git from 'isomorphic-git';
import * as http from 'isomorphic-git/http/node';

export class npmAnalysis {
    async cloneRepo(url: string, dir: string): Promise<void> {
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
    
    async getCommitHistory(dir: string): Promise<void> {
        console.log('Fetching commit history...');
        try {
            const commits = await git.log({ fs, dir });
            console.log('Commit history:', commits[0]);
        } catch (err) {
            console.error('Error fetching commit history:', err);
        }
    }

    async getNumberOfContributors(dir: string): Promise<number> {
        const log = await git.log({ fs, dir });
        const contributors = new Set(log.map(commit => commit.author.name));
        return contributors.size;
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
    async runTasks(url: string): Promise<void> {
        const repoDir = './repoDir';
    
        // Run each function sequentially
        await this.cloneRepo(url, repoDir);
        await this.getCommitHistory(repoDir);
        await this.deleteRepo(repoDir);
    
        console.log('All tasks completed in order');
    }
}

export class gitAnalysis {

}