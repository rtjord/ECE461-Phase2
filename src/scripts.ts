import { urlAnalysis } from './urlOps';
import { gitAnalysis, npmAnalysis } from './api';

export async function evaluateMods(urls: string[], token: string) {
    if (!token) {
        //log error
        console.error('No token provided');
        process.exit(1);
      }

    //const Promise = require('bluebird');
    //const connectionsAndCommunicators = await Promise.map(urls, async (url: string) => {
    for (const url of urls) {
        const analysis = new urlAnalysis();
        try {
            const [type, resultUrl] = await analysis.evalUrl(url);
            if (type == 0) { // GitHub url
                console.log('GitHub URL: ', resultUrl);
            } else if (type == 1) { //NPM url
                console.log('NPM URL: ', resultUrl);
                if (resultUrl == '') {
                    console.error('Invalid URL');
                    continue;
                }
                const npmClass = new npmAnalysis();
                await npmClass.runTasks(resultUrl);
            } else { //log error
                console.error('Invalid URL');
                process.exit(1);
            }
        } catch (error) {
            console.error('Error evaluating URL:', error);
        } 
    }
}

const exFileLog = [
    "https://github.com/nullivex/nodist",
    "https://www.npmjs.com/package/express",
    "https://github.com/lodash/lodash",
    "https://www.npmjs.com/package/browserify",
];

evaluateMods(exFileLog, 'token');