import { Command } from 'commander';
import { envVars } from './tools/getEnvVars';
import { runAnalysis } from './tools/scripts';
import { parseURLsToArray } from './tools/urlOps';
import { repoData } from './utils/interfaces';
import dotenv from 'dotenv';

dotenv.config();
const program = new Command();

program
    .version('1.0.0')
    .description('ECE461 Package Registry Analysis Phase 1')

program
    .command('install')
    .description('Install all required packages')
    .action((name) => {
        console.log('NEED TO INSTALL');
    });

program
    .argument('<URL_FILE>', 'File containing URLs to analyze')
    .action(async (urlFile: string) => {
        const envVar: envVars = new envVars();
        const urlList: string[] = await parseURLsToArray(urlFile);
        const runAnalysisClass = new runAnalysis(envVar);
        const repoData = await runAnalysisClass.runAnalysis(urlList);
        for (const repo of repoData) {
            console.log(repo);
        }
        //console.log('Analyzing URLs from file: ${urlFile}');

    });

program
    .command('test')
    .description('Run tests')
    .action(() => {
        console.log('Running tests');
    });

program.parse(process.argv);