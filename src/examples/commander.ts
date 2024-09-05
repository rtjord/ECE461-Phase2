import { Command } from 'commander';

const program = new Command();

program
    .version('1.0.0')
    .description('A basic program using commander.js')
    .option('-n, --name <name>', 'Specify your name')
    .option('-a, --age <age>', 'Specify your age')
    .action((options) => {
        console.log(`Hello, ${options.name}! You are ${options.age} years old.`);
    });

program.parse(process.argv);
program
    .command('greet <name>')
    .description('Greet a person')
    .action((name) => {
        console.log(`Hello, ${name}!`);
    });

program
    .command('multiply <num1> <num2>')
    .description('Multiply two numbers')
    .action((num1, num2) => {
        const result = parseInt(num1) * parseInt(num2);
        console.log(`The result of multiplying ${num1} and ${num2} is ${result}.`);
    });