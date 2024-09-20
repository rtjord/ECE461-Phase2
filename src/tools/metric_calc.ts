//HOW DO I WRITE THIS IMPORT STATEMENT CORRECTLY???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
import { repoData } from '../utils/interfaces'; // Assuming the path is correct
import { metricData } from '../utils/interfaces';
import { repoLatencyData } from '../utils/types';

//***********************************************************************NOTES************************************************************************************ */
//1. Figure out if its imported correctly
//2. Figure out if the data is being passsed in correctly
//3. Figure out variable name for the size of the ReadME
//4. Test run this with fake data
//5. Push updated script to Github
//**************************************************************************************************************************************************************** */

export class metricCalc{

    calculateCorrectness(data: repoData): number 
    {
        // Calculate correctness metric based on the data
        let correctness = 0;
        const { numberOfOpenIssues, numberOfClosedIssues } = data;
        if(numberOfOpenIssues/numberOfClosedIssues <= 0.5){
            correctness = 1;
            return(correctness);
        }
        else if((1 - (numberOfOpenIssues / (numberOfClosedIssues))) < 0){
            correctness = 0;
            return(correctness);
        }
        else if(numberOfClosedIssues == 0){
            correctness = 0;
            return(correctness);
        }
        else{
            correctness = 1 - (numberOfOpenIssues / (numberOfClosedIssues));
            return correctness;
        }
    }

    getCorrectnessLatency(latency: repoLatencyData): number 
    {
        return parseFloat((latency.openIssues + latency.closedIssues).toFixed(3));
    }

    calculateBusFactor(data: repoData): number 
    {
        const { numberOfContributors } = data;
        let busFactor = 0;

        if (numberOfContributors < 15) busFactor = 0;
        else if (numberOfContributors < 50) busFactor = 0.25;
        else if (numberOfContributors < 100) busFactor = 0.5;
        else if (numberOfContributors < 200) busFactor = 0.75;
        else busFactor = 1;

        return busFactor;
    }

    calculateRampup(data: repoData): number
    {
        // Calculate rampup metric based on the data
        // Example:
        const { numberOfLines, numberOfCommits, documentation } = data;
        let doc_total = 0;
        
        //Create the weightage for the Readme
        if(documentation.numLines > 300) doc_total += 0.1;
        if(documentation.hasExamples == true) doc_total += 0.1;
        if(documentation.hasDocumentation == true) doc_total += 0.14;
        if(documentation.hasReadme == true) doc_total *= 1;

        const rampup = (numberOfLines > 500 ? 0.33 : 0) + (numberOfCommits > 1000 ? 0.33 : 0) + (doc_total);
        return rampup;
    }

    getRampupLatency(latency: repoLatencyData): number 
    {
        return parseFloat((latency.numberOfLines + latency.numberOfCommits + latency.documentation).toFixed(3));
    }

    calculateResponsiveness(data: repoData): number 
    {
        // Calculate responsiveness metric based on the data
        const currentDate = new Date();
        const commitDate = new Date(data.lastCommitDate);
        const timeDifference = currentDate.getTime() - commitDate.getTime();
        const monthsDifference = timeDifference / (1000 * 3600 * 24 * 12.0);

        return parseFloat((1 / monthsDifference).toFixed(3));
    }

    checkLicenseExistence(data: repoData): number 
    {
        // Check if a specific license exists in the data
        const allowedLicenses = ['MIT', 'BSD-3-Clause', 'Apache-2.0', 'LGPL-2.1'];
        return data.licenses[0] == '' ? 0 : 1;
    }

    calculateNetScore(data: repoData): number 
    {
        // Calculate the net score based on the individual metrics
        const weightedScore = (0.3 * this.calculateResponsiveness(data)) + (0.25 * this.calculateCorrectness(data)) + (0.25 * this.calculateRampup(data)) + (0.2 * this.calculateBusFactor(data));
        return this.checkLicenseExistence(data) === 1 ? weightedScore * 1 : weightedScore * 0;
    }

    getNetScoreLatency(latency: repoLatencyData): number 
    {
        return parseFloat((latency.numberOfLines + latency.openIssues + latency.closedIssues + latency.openIssues + latency.licenses + latency.numberOfCommits + latency.numberOfLines + latency.documentation).toFixed(3));
    }

    getValue(data: repoData): metricData {
        return {
            URL: data.repoUrl,
            NetScore: this.calculateNetScore(data),
            NetScore_Latency: this.getNetScoreLatency(data.latency),
            RampUp: this.calculateRampup(data),
            RampUp_Latency: this.getRampupLatency(data.latency),
            Correctness: this.calculateCorrectness(data),
            Correctness_Latency: this.getCorrectnessLatency(data.latency),
            BusFactor: this.calculateBusFactor(data),
            BusFactor_Latency: parseFloat((data.latency.contributors).toFixed(3)),
            ResponsiveMaintainer: this.calculateResponsiveness(data),
            ResponsiveMaintainer_Latency: parseFloat((data.latency.lastCommitDate).toFixed(3)),
            License: this.checkLicenseExistence(data),
            License_Latency: parseFloat((data.latency.licenses).toFixed(3))
        };
    }
}