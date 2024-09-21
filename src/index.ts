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
            let coverage = '0';

            (stdout.split('\n')).forEach(element => {
                if (element.includes("All files")){
                    let coverageArray = element.split('|');
                    coverage = parseInt(coverageArray[coverageArray.length - 2]).toString().trim();
                }
            });

            stderr.split('\n').forEach(element => {
                if (element.includes("Tests:")){
                    let testMatches = element.match(/(\d+) passed, (\d+) total/);
                    if(testMatches) {
                        passedTests = testMatches[1];
                        totalTests = testMatches[2];
                    }
                }
            });

            // Format and display the final output in the desired structure
            console.log(`Total: ${totalTests}`);
            console.log(`Passed: ${passedTests}`);
            console.log(`Coverage: ${coverage}%`);
            console.log(`${passedTests}/${totalTests} test cases passed. ${coverage}% line coverage achieved.`);
        });
    });

program.parse(process.argv);