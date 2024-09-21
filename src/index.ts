import { Command } from 'commander';
import { exec } from 'child_process';
import { getEnvVars } from './tools/getEnvVars';
import { runAnalysis } from './tools/scripts';
import { parseURLsToArray } from './tools/urlOps';
import { repoData } from './utils/interfaces';
import { metricCalc } from './tools/metricCalc';
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
        const envVar: getEnvVars = new getEnvVars();
        const urlList: string[] = await parseURLsToArray(urlFile);
        const runAnalysisClass = new runAnalysis(envVar);
        const repoData = await runAnalysisClass.runAnalysis(urlList);
        
        for (const repo of repoData) {
            const metricCalcClass = new metricCalc();
            const result = metricCalcClass.getValue(repo);
            console.log(JSON.stringify(result).replace(/,/g, ', '));
        }
        process.exit(0);
    });

program
    .command('test')
    .description('Run tests')
    .action(() => {
        exec('npx jest ./srcJS/tests/', (error, stdout, stderr) => {
          if (error) {
            console.error(`Error running tests: ${error.message}`);
            return;
          }

          if (stderr) {
            console.error(`Test error output: ${stderr}`);
            return;
          }

          console.log(`Test output:\n${stdout}`);
        });
    });

program.parse(process.argv);