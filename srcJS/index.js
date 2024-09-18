"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
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
    .action((urlFile) => {
    console.log('Analyzing URLs from file: ${urlFile}');
});
program
    .command('test')
    .description('Run tests')
    .action(() => {
    console.log('Running tests');
});
