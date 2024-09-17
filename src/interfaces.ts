export interface repoData {
    repoName: string;
    repoUrl: string;
    repoOwner: string;
    numberOfContributors: number;
    numberOfOpenIssues: number;
    numberOfClosedIssues: number;
    timeSinceLastCommit: string;
    licenses: string[];
    numberOfCommits: number;
    numberOfLines: number;
}

export interface npmData {
    repoUrl: string;
    numberOfContributors: number;
}