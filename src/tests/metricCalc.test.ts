import { repoData } from '../utils/interfaces';
import { metricCalc } from '../tools/metricCalc';

// Mock Data for Testing
const fakeRepoData: repoData = {
    repoName: 'example-repo',
    repoUrl: 'https://github.com/example-repo',
    repoOwner: 'example-owner',
    numberOfContributors: 400,
    numberOfOpenIssues: 10,
    numberOfClosedIssues: 20,
    lastCommitDate: "10000",
    licenses: [''],
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

describe('metricCalcClass', () => {
    let metricClass: metricCalc;

    beforeEach(() => {
        // Initialize the class with fakeRepoData
        metricClass = new metricCalc();
    });

    // Test the correctness calculation
    it('should calculate correctness metric correctly', () => {
        const correctness = metricClass.calculateCorrectness(fakeRepoData);
        expect(correctness).toBe(1); // Update the expected value based on your formula
    });

    // Test the bus factor calculation
    it('should calculate bus factor correctly', () => {
        const busFactor = metricClass.calculateBusFactor(fakeRepoData);
        expect(busFactor).toBe(1); // Since numberOfContributors > 200
    });

    // Test the ramp-up calculation
    it('should calculate ramp-up correctly', () => {
        const rampup = metricClass.calculateRampup(fakeRepoData);
        expect(rampup).toBeGreaterThan(0); // Adjust according to your expectations
    });

    // Test the responsiveness calculation
    it('should calculate responsiveness correctly', () => {
        const responsiveness = metricClass.calculateResponsiveness(fakeRepoData);
        expect(responsiveness).toBeGreaterThan(0); // Example responsiveness test
    });

    // Test the license existence check
    it('should check license existence correctly', () => {
        const licenseExistence = metricClass.checkLicenseExistence(fakeRepoData);
        expect(licenseExistence).toBe(0); // MIT License should pass
    });

    // Test the net score calculation
    it('should calculate net score correctly', () => {
        const netScore = metricClass.calculateNetScore(fakeRepoData); // Use arbitrary values for the test
        expect(netScore).toBeGreaterThan(0); // Example test
    });

    // Test the overall getValue function
    it('should return correct values from getValue method', () => {
        const result = metricClass.getValue(fakeRepoData);
        expect(result).toHaveProperty('URL', fakeRepoData.repoUrl);
        expect(result).toHaveProperty('NetScore');
        expect(result).toHaveProperty('Correctness');
        expect(result).toHaveProperty('BusFactor');
        expect(result).toHaveProperty('RampUp');
        expect(result).toHaveProperty('ResponsiveMaintainer');
        expect(result).toHaveProperty('License');
    });
    // Test edge case for last commit date
    it('should handle last commit date correctly', () => {
        fakeRepoData.lastCommitDate = "0"; // Edge case for the oldest commit
        const rampup = metricClass.calculateRampup(fakeRepoData);
        expect(rampup).toBeGreaterThan(0); // Adjust according to your expectations
    });
});

//Checker number two********************************************************************************************************************

// Mock Data for Testing
const fakeRepoData2: repoData = {
    repoName: 'example-repo',
    repoUrl: 'https://github.com/example-repo',
    repoOwner: 'example-owner',
    numberOfContributors: 4,
    numberOfOpenIssues: 40,
    numberOfClosedIssues: 20,
    lastCommitDate: "1000",
    licenses: ['MIT License'],
    numberOfCommits: 120,
    numberOfLines: 200,
    documentation: {
        hasReadme: true,
        numLines: 10,
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

describe('metricCalcClass', () => {
    let metricClass: metricCalc;

    beforeEach(() => {
        // Initialize the class with fakeRepoData
        metricClass = new metricCalc();
    });

    // Test the correctness calculation
    it('should calculate correctness metric correctly', () => {
        const correctness = metricClass.calculateCorrectness(fakeRepoData2);
        expect(correctness).toBe(1); // Update the expected value based on your formula
    });

    // Test the bus factor calculation
    it('should calculate bus factor correctly', () => {
        const busFactor = metricClass.calculateBusFactor(fakeRepoData2);
        expect(busFactor).toBe(1); // Since numberOfContributors > 200
    });

    // Test the ramp-up calculation
    it('should calculate ramp-up correctly', () => {
        const rampup = metricClass.calculateRampup(fakeRepoData2);
        expect(rampup).toBeGreaterThan(0); // Adjust according to your expectations
    });

    // Test the responsiveness calculation
    it('should calculate responsiveness correctly', () => {
        const responsiveness = metricClass.calculateResponsiveness(fakeRepoData2);
        expect(responsiveness).toBeGreaterThan(0); // Example responsiveness test
    });

    // Test the license existence check
    it('should check license existence correctly', () => {
        const licenseExistence = metricClass.checkLicenseExistence(fakeRepoData2);
        expect(licenseExistence).toBe(0); // MIT License should pass
    });

    // Test the net score calculation
    it('should calculate net score correctly', () => {
        const netScore = metricClass.calculateNetScore(fakeRepoData2); // Use arbitrary values for the test
        expect(netScore).toBeGreaterThan(0); // Example test
    });

    // Test the overall getValue function
    it('should return correct values from getValue method', () => {
        const result = metricClass.getValue(fakeRepoData2);
        expect(result).toHaveProperty('URL', fakeRepoData2.repoUrl);
        expect(result).toHaveProperty('NetScore');
        expect(result).toHaveProperty('Correctness');
        expect(result).toHaveProperty('BusFactor');
        expect(result).toHaveProperty('RampUp');
        expect(result).toHaveProperty('ResponsiveMaintainer');
        expect(result).toHaveProperty('License');
    });
    // Test edge case for last commit date
    it('should handle last commit date correctly', () => {
        fakeRepoData2.lastCommitDate = "0"; // Edge case for the oldest commit
        const rampup = metricClass.calculateRampup(fakeRepoData2);
        expect(rampup).toBeGreaterThan(0); // Adjust according to your expectations
    });
});