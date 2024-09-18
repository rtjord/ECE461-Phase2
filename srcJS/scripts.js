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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAnalysis = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const urlOps_1 = require("./urlOps");
const api_1 = require("./api");
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
class runAnalysis {
    constructor(token) {
        if (!token) {
            console.error('No token provided');
            process.exit(1);
        }
        this.token = token;
        this.npmAnalysis = new api_1.npmAnalysis();
        this.gitAnalysis = new api_1.gitAnalysis(token);
        this.urlAnalysis = new urlOps_1.urlAnalysis();
    }
    // Function to read the file and store URLs in an array
    parseURLsToArray(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const fileStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });
            const urlArray = []; // Array to store URLs
            try {
                // Process each line (URL) in the file
                for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), _a = rl_1_1.done, !_a; _d = true) {
                    _c = rl_1_1.value;
                    _d = false;
                    const line = _c;
                    urlArray.push(line); // Add the URL to the array
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = rl_1.return)) yield _b.call(rl_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return urlArray;
        });
    }
    runAnalysis(urls) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.token) {
                //log error
                console.error('No token provided');
                process.exit(1);
            }
            // call gitAnalysis and check if the token is valid
            // CHECK HERE using this.gitAnalysis.blahblah()
            const repoDataPromises = urls.map((url, index) => this.evaluateMods(url, index));
            // Use Promise.all to wait for all promises to resolve in parallel
            const repoDataArr = yield Promise.all(repoDataPromises);
            for (const repo of repoDataArr) {
                console.log(repo);
            }
            return repoDataArr;
        });
    }
    evaluateMods(url, index) {
        return __awaiter(this, void 0, void 0, function* () {
            const [type, cleanedUrl] = yield this.urlAnalysis.evalUrl(url);
            console.log('Type:', type, 'Cleaned URL:', cleanedUrl);
            let repoData = {
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
            const [npmData, gitData] = yield Promise.all([
                yield this.npmAnalysis.runTasks(cleanedUrl, index),
                yield this.gitAnalysis.runTasks(cleanedUrl)
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
        });
    }
}
exports.runAnalysis = runAnalysis;
dotenv_1.default.config({ path: '../.env' });
const token = process.env.GITHUB_TOKEN;
if (!token) {
    console.error('GitHub token is not defined in environment variables');
    process.exit(1);
}
//console.log(token);
const runAnalysisClass = new runAnalysis(token);
const fileName = process.argv[2];
runAnalysisClass.parseURLsToArray(fileName)
    .then(urlArray => {
    //console.log(urlArray);
    runAnalysisClass.runAnalysis(urlArray);
})
    .catch(console.error);
