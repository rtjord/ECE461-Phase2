"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitAnalysis = exports.npmAnalysis = void 0;
const fs = __importStar(require("fs/promises"));
const git = __importStar(require("isomorphic-git"));
const http = __importStar(require("isomorphic-git/http/node"));
const axios_1 = __importDefault(require("axios"));
class npmAnalysis {
    cloneRepo(url, dir) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the directory already exists
                try {
                    yield fs.access(dir);
                    console.log(`Repository already exists in directory: ${dir}`);
                    // If the repository exists, delete it
                    console.log('Deleting existing repository...');
                    yield fs.rm(dir, { recursive: true, force: true });
                    console.log('Repository deleted.');
                }
                catch (err) {
                    // Directory does not exist, no need to delete
                    console.log('Directory does not exist, proceeding to clone...');
                }
                // Proceed to clone the repository
                console.log('Cloning repository...');
                yield git.clone({
                    fs,
                    http,
                    dir,
                    url,
                    singleBranch: true,
                });
                console.log('Repository cloned.');
            }
            catch (err) {
                console.error('Error cloning repository:', err);
            }
        });
    }
    getReadmeContent(dir, npmData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const oid = yield git.resolveRef({ fs, dir, ref: 'HEAD' });
                const { tree } = yield git.readTree({ fs, dir, oid });
                const readmeEntry = tree.find(entry => ['readme.md', 'readme', 'readme.txt', 'readme.rst'].includes(entry.path.toLowerCase()));
                let readmeContent = null;
                if (readmeEntry) {
                    // Found a README file in the repository
                    const readmeBlob = yield git.readBlob({ fs, dir, oid: readmeEntry.oid });
                    readmeContent = new TextDecoder().decode(readmeBlob.blob);
                }
                else {
                    // No README file found, try to fetch README from the package URL (if applicable)
                    console.log('No README file found in the repository tree. Trying to fetch via package URL...');
                    const readmeUrl = `${npmData.repoUrl}#readme`; // Construct URL to fetch README
                    const response = yield fetch(readmeUrl);
                    if (response.ok) {
                        readmeContent = yield response.text();
                    }
                    else {
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
            }
            catch (err) {
                console.error('Error retrieving the README content:', err);
            }
            return;
        });
    }
    lastCommitDate(dir, npmData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Finding time since last commit...');
            try {
                const commits = yield git.log({ fs, dir, depth: 1 });
                const lastCommit = commits[0];
                if (lastCommit) {
                    const lastCommitDate = new Date(lastCommit.commit.author.timestamp * 1000);
                    npmData.lastCommitDate = lastCommitDate.toDateString();
                    ;
                    return;
                }
                else {
                    console.log('No commits found in the repository.');
                    return;
                }
            }
            catch (err) {
                console.error('Error retrieving the last commit:', err);
                return;
            }
        });
    }
    deleteRepo(dir) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Deleting repository...');
            try {
                yield fs.rm(dir, { recursive: true, force: true });
                console.log('Repository deleted');
            }
            catch (err) {
                console.error('Failed to delete repository:', err);
            }
        });
    }
    // Main function to run the tasks in order
    runTasks(url, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoDir = './repoDir' + dest.toString();
            let npmData = {
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
            yield this.cloneRepo(url, repoDir);
            yield this.lastCommitDate(repoDir, npmData);
            yield this.getReadmeContent(repoDir, npmData);
            yield this.deleteRepo(repoDir);
            console.log('All npm tasks completed in order');
            return npmData;
        });
    }
}
exports.npmAnalysis = npmAnalysis;
class gitAnalysis {
    //axios instance using tokens, loglevel, logfile from keys.n
    constructor(token) {
        this.token = token;
        this.axiosInstance = axios_1.default.create({
            baseURL: 'https://api.github.com', // Set a base URL for all requests
            timeout: 5000, // Set a request timeout (in ms)
            headers: {
                'Content-Type': 'application/json', // Default content type
                'Accept': 'application/vnd.github.v3+json', // Custom accept header for GitHub API version
                'Authorization': 'Bearer ' + token // Authorization header with token
            }
        });
    }
    isTokenValid() {
        return __awaiter(this, void 0, void 0, function* () {
            let isValid = false;
            const response = yield this.axiosInstance.get('https://github.com/lodash/lodash');
            response.status === 200 ? isValid = true : isValid = false;
            return isValid;
        });
    }
    //make sure of connection
    checkConnection(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Make a simple request to GitHub to check the rate limit endpoint
                const response = yield this.axiosInstance.get(url);
                // If the request succeeds, print the rate limit and return true
                console.log('Connection successful:', response.status);
                return true;
            }
            catch (error) {
                // If an error occurs, log it and return false
                console.error('Connection failed:', error);
                return false;
            }
        });
    }
    //parse owner from url
    getOwnerAndRepo(gitData) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            else {
                console.error('Invalid GitHub repository URL format.');
                return;
            }
        });
    }
    //retrieve data by calling correct endpoints
    //retrieve data for open issues
    fetchOpenIssues(gitData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching open issues...');
            try {
                const issues = yield this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}`); //get request and await response
                gitData.numberOfOpenIssues = issues.data.open_issues_count; //grab the data
                console.log('Open Issues fetched successfully:', gitData.numberOfOpenIssues);
                return;
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    //retrieve data for closed issues
    fetchClosedIssues(gitData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching closed issues...');
            try {
                let page = 1;
                let totalClosedIssues = 0;
                let issues;
                do {
                    // Fetch a page of closed issues
                    const response = yield this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/issues`, {
                        params: {
                            state: 'closed',
                            per_page: 100, // Max per page
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
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    //retrieve data for number of contributors
    fetchContributors(gitData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching contributors...');
            try {
                // Initialize variables
                let page = 1;
                let contributorsCount = 0;
                let hasMorePages = true;
                // Fetch contributors with pagination
                while (hasMorePages) {
                    const response = yield this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/contributors`, {
                        params: {
                            per_page: 100, // Fetch up to 100 contributors per page
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
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    //retrieve data for liscense
    fetchLicense(gitData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching license...');
            try {
                // Fetch license information
                const response = yield this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/license`);
                gitData.licenses = response.data.license.name;
                console.log('License name:', gitData.licenses);
                return;
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    //retrieve data for number of commits
    fetchCommits(gitData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching commits...');
            try {
                // Initialize count
                let totalCommits = 0;
                let page = 1;
                let hasMoreCommits = true;
                while (hasMoreCommits) {
                    const response = yield this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/commits`, {
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
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    //retrieve total number of lines
    fetchLines(gitData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Fetching lines of code...');
            try {
                let totalLines = 0;
                // Fetch the list of files in the root directory
                const response = yield this.axiosInstance.get(`/repos/${gitData.repoOwner}/${gitData.repoName}/contents`, {
                    params: { per_page: 100 } // Adjust as needed
                });
                const files = response.data;
                // Process each file
                const filePromises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                    if (file.type === 'file') {
                        try {
                            const fileResponse = yield axios_1.default.get(file.download_url);
                            return fileResponse.data.split('\n').length;
                        }
                        catch (error) {
                            // console.error('Error fetching file content:', error);
                            return;
                        }
                    }
                    return;
                }));
                const fileLines = yield Promise.all(filePromises);
                totalLines += fileLines.reduce((sum, value) => sum + value, 0);
                gitData.numberOfLines = totalLines;
                console.log('Total lines of code:', gitData.numberOfLines);
                return;
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    runTasks(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let gitData = {
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
            yield this.checkConnection(url);
            yield this.getOwnerAndRepo(gitData);
            yield this.fetchContributors(gitData);
            yield this.fetchOpenIssues(gitData);
            yield this.fetchClosedIssues(gitData); //CURRENTLY NOT WORKING FOR ONE OF THE URLS or slow
            //await this.fetchLastCommit(owner,repo);
            yield this.fetchLicense(gitData); //take another way
            yield this.fetchCommits(gitData); //slow
            yield this.fetchLines(gitData); //error for some files (currently not printing error)
            console.log('All git tasks completed in order');
            return gitData;
        });
    }
}
exports.gitAnalysis = gitAnalysis;
