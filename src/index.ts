import { Command } from 'commander';
import { exec } from 'child_process';
import { getEnvVars } from './tools/getEnvVars';
import { envVars } from './utils/interfaces';
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
        const envVar: envVars = new getEnvVars();
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
        exec('npx jest --coverage ./srcJS/tests', (error, stdout, stderr) => {
          if (error || stderr) {
            process.exit(1);
          }
          console.log(`Test output:\n${stdout}`);
        });
    });

program.parse(process.argv);