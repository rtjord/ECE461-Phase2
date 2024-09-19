import { documentationData } from "./types";

export interface repoData {
    repoName: string;
    repoUrl: string;
    repoOwner: string;
    numberOfContributors: number;
    numberOfOpenIssues: number;
    numberOfClosedIssues: number;
    lastCommitDate: string;
    licenses: string[];
    numberOfCommits: number;
    numberOfLines: number;
    documentation: documentationData;
}

export interface gitData {
    repoName: string;
    repoUrl: string;
    repoOwner: string;
    numberOfContributors: number;
    numberOfOpenIssues: number;
    numberOfClosedIssues: number;
    licenses: string[];
    numberOfCommits: number;
    numberOfLines: number;
}

export interface npmData {
    repoUrl: string;
    lastCommitDate: string;
    documentation: documentationData;
}

export interface envVars {
    token: string;
    logLevel: number;
    logFilePath: string;
}