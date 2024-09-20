//HOW DO I WRITE THIS IMPORT STATEMENT CORRECTLY???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
import { repoData } from '../utils/interfaces'; // Assuming the path is correct
import { metricData2 } from '../utils/interfaces';
import { metricData1 } from '../utils/interfaces';

//***********************************************************************NOTES************************************************************************************ */
//1. Figure out if its imported correctly
//2. Figure out if the data is being passsed in correctly
//3. Figure out variable name for the size of the ReadME
//4. Test run this with fake data
//5. Push updated script to Github
//**************************************************************************************************************************************************************** */

class metricCalcClass{
    correctness: number;
    busFactor: number;
    rampup: number;
    responsiveness: number;
    licenseExistence: number;
    netScore: number;
    metricData: metricData2[];

    constructor(repoData: repoData, correctness: number, busFactor: number, rampup: number, responsiveness: number, licenseExistence: number, netScore: number, metricData: metricData2[])
    {
        this.correctness = correctness;
        this.busFactor = busFactor;
        this.rampup = rampup;
        this.responsiveness = responsiveness;
        this.licenseExistence = licenseExistence;
        this.netScore = netScore;
        this.metricData = metricData;
    }
    //Gets the data from the interface and passes it to the sub-functions doing the calculations
    extractmetricData(data: repoData): metricData2[] 
    {
        const metricData: metricData2[] = [];

        const correctness = this.calculateCorrectness(data);
        const busFactor = this.calculateBusFactor(data);
        const rampup = this.calculateRampup(data);
        const responsiveness = this.calculateResponsiveness(data);
        const licenseExistence = this.checkLicenseExistence(data);

        const netScore = this.calculateNetScore(correctness, busFactor, rampup, responsiveness, licenseExistence);

        // Push each metric into the array
        metricData.push({ name: 'Correctness', value: correctness });
        metricData.push({ name: 'Bus Factor', value: busFactor });
        metricData.push({ name: 'Rampup', value: rampup });
        metricData.push({ name: 'Responsiveness', value: responsiveness });
        metricData.push({ name: 'License Existence', value: licenseExistence });
        metricData.push({ name: 'Net Score', value: netScore });

        return metricData;
    }

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

    calculateRampup(data: repoData): number //NOT SURE WHAT SIZE OF README VARIABLE IS YET!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!?????????????????????????????????
    {
        // Calculate rampup metric based on the data
        // Example:
        const { numberOfLines, numberOfCommits, documentation } = data;
        let value1 = 0;
        let value2 = 0;
        let value3 = 0;
        let value4 = 0;
        
        
        //Create the weightage for the Readme
        if(documentation.hasReadme == true) value1 = 1;
        else value1 = 0;
        
        if(documentation.numLines > 300) value2 = 0.1;
        else value2 = 0;

        if(documentation.hasExamples == true) value3 = 0.1;
        else value3 = 0;

        if(documentation.hasDocumentation == true) value4 = 0.14;
        else value4 = 0;

        let doc_total = value1 *(value2 + value3 + value4);

        const rampup = (numberOfLines > 500 ? 0.33 : 0) + (numberOfCommits > 1000 ? 0.33 : 0) + (doc_total);
        return rampup;
    }

    calculateResponsiveness(data: repoData): number 
    {
        // Calculate responsiveness metric based on the data
        // Example:
        // const responsiveness = data.responsiveness;
        // return responsiveness;
        const { lastCommitDate } = data;
        const commitTime = parseFloat(lastCommitDate);
        return (1 / commitTime);
    }

    checkLicenseExistence(data: repoData): number 
    {
        // Check if a specific license exists in the data
        const allowedLicenses = ['MIT License', 'BSD-3-Clause', 'Apache-2.0', 'LGPL-2.1'];
        return data.licenses.some(license => allowedLicenses.includes(license)) ? 1 : 0; //MIGHT HAVE TO FIX THE LICENSE VARIABLE HERE
        
    }

    calculateNetScore(correctness: number, busFactor: number, rampup: number, responsiveness: number, licenseExistence: number): number 
    {
        // Calculate the net score based on the individual metrics
        // Example:
        // const netScore = correctness + busFactor + rampup + responsiveness;
        const weightedScore = (0.3 * responsiveness) + (0.25 * correctness) + (0.25 * rampup) + (0.2 * busFactor);
        return licenseExistence === 1 ? weightedScore * 1 : weightedScore * 0;
        
        // const extractedData = this.extractmetricData(repoData); 
        // console.log(extractedData);
        
    }
    getValue(data: repoData): metricData1 {
        const metricData = this.extractmetricData(data);
        return {
            URL: data.repoUrl,
            NetScore: this.calculateNetScore(
                this.calculateCorrectness(data),
                this.calculateBusFactor(data),
                this.calculateRampup(data),
                this.calculateResponsiveness(data),
                this.checkLicenseExistence(data)
            ),
            NetScore_Latency: 0,
            RampUp: this.calculateRampup(data),
            RampUp_Latency: 0,
            Correctness: this.calculateCorrectness(data),
            Correctness_Latency: 0, // Assuming latency is zero for simplicity
            BusFactor: this.calculateBusFactor(data),
            BusFactor_Latency: 0,
            ResponsiveMaintainer: this.calculateResponsiveness(data),
            ResponsiveMaintainer_Latency: 0,
            License: this.checkLicenseExistence(data),
            License_Latency: 0,

        };
    }

}

const fakeRepoData: repoData = {
    repoName: 'example-repo',
    repoUrl: 'https://github.com/example-repo', // This will be omitted from the final output
    repoOwner: 'example-owner',
    numberOfContributors: 400,
    numberOfOpenIssues: 10,
    numberOfClosedIssues: 20,
    lastCommitDate: "10000", // Example value for commit time in milliseconds
    licenses: ['MIT License'],
    numberOfCommits: 1200,
    numberOfLines: 600,
    documentation: {
        hasReadme: true,
        numLines: 1000,
        hasExamples: true,
        hasDocumentation: true
    },
    latency: {
        contributors: -1,
        openIssues: -1,
        closedIssues: -1,
        lastCommitDate: -1,
        licenses: -1,
        numberOfCommits: -1,
        numberOfLines: -1,
        documentation: -1
    }
};

const metricClass = new metricCalcClass(fakeRepoData, 0, 0, 0, 0, 0, 0, []);
const result = metricClass.getValue(fakeRepoData);
delete result.metricData;
//console.log(JSON.stringify(result, null, 2)); // Print the result to the console
const formattedOutput = JSON.stringify(result).replace(/,/g, ', '); // Add a space after each comma
console.log(formattedOutput); // Outputs the result with spaces after commas