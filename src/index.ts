import { Command } from 'commander';
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
    .action((urlFile: string[]) => {
        console.log('Analyzing URLs from file: ${urlFile}');
    });

program
    .command('test')
    .description('Run tests')
    .action(() => {
        console.log('Running tests');
    });