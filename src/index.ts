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
        exec('npx jest --coverage ./srcJS/tests/', (error, stdout, stderr) => {
            let totalTests = '0';
            let passedTests = '0';

            let coverage = (parseInt(((stdout.split('\n'))[3].split('|'))[4])).toString().trim();
            let testMatches = stderr.split('\n')[5].match(/(\d+) passed, (\d+) total/);
            if(testMatches) {
                totalTests = testMatches[1];
                passedTests = testMatches[2];
            }

            // Format and display the final output in the desired structure
            console.log(`Total: ${totalTests}`);
            console.log(`Passed: ${passedTests}`);
            console.log(`Coverage: ${coverage}%`);
            console.log(`${passedTests}/${totalTests} test cases passed. ${coverage}% line coverage achieved.`);
        });
    });

program.parse(process.argv);