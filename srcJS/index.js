"use strict";
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
const commander_1 = require("commander");
const getEnvVars_1 = require("./tools/getEnvVars");
const scripts_1 = require("./tools/scripts");
const urlOps_1 = require("./tools/urlOps");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const program = new commander_1.Command();
program
    .version('1.0.0')
    .description('ECE461 Package Registry Analysis Phase 1');
program
    .command('install')
    .description('Install all required packages')
    .action((name) => {
    console.log('NEED TO INSTALL');
});
program
    .argument('<URL_FILE>', 'File containing URLs to analyze')
    .action((urlFile) => __awaiter(void 0, void 0, void 0, function* () {
    const envVar = new getEnvVars_1.envVars();
    const urlList = yield (0, urlOps_1.parseURLsToArray)(urlFile);
    const runAnalysisClass = new scripts_1.runAnalysis(envVar);
    const repoData = yield runAnalysisClass.runAnalysis(urlList);
    for (const repo of repoData) {
        console.log(repo);
    }
    //console.log('Analyzing URLs from file: ${urlFile}');
}));
program
    .command('test')
    .description('Run tests')
    .action(() => {
    console.log('Running tests');
});
program.parse(process.argv);
