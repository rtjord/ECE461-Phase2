"use strict";
/**
 * Extracts metric data from a JSON packet.
 * @param jsonPacket JSON packet containing metric data.
 * @returns An array of MetricData objects.
 */
function extractMetricData(jsonPacket) {
    const metricData = []; //Stores extracted metric data
    try {
        const data = JSON.parse(jsonPacket); //Parse JSON packet
        const correctness = calculateCorrectness(data);
        const busFactor = calculateBusFactor(data);
        const rampup = calculateRampup(data);
        const responsiveness = calculateResponsiveness(data);
        const licenseExistence = checkLicenseExistence(data);
        const netScore = calculateNetScore(correctness, busFactor, rampup, responsiveness, licenseExistence);
        //Push each metric into the array
        metricData.push({ name: 'Correctness', value: correctness });
        metricData.push({ name: 'Bus Factor', value: busFactor });
        metricData.push({ name: 'Rampup', value: rampup });
        metricData.push({ name: 'Responsiveness', value: responsiveness });
        metricData.push({ name: 'License Existence', value: licenseExistence });
        metricData.push({ name: 'Net Score', value: netScore });
    }
    catch (error) {
        console.error('Error parsing JSON packet:', error);
    }
    return metricData;
}
function calculateCorrectness(data) {
    // Calculate correctness metric based on the data
    const openIssues = data.openIssues;
    const closedIssues = data.closedIssues;
    const correctness = 1 - (openIssues / closedIssues);
    return correctness;
    // const correctness = data.correctness;
    // return correctness;
}
function calculateBusFactor(data) {
    // Calculate bus factor metric based on the data
    const activeMembers = data.activeMembers;
    const busFactor = activeMembers * 0.25;
    return busFactor;
}
function calculateRampup(data) {
    // Calculate rampup metric based on the data
    // Example:
    const rampup = (data.linesOfCode > 500 ? 0.5 : 0) + (data.users > 10000 ? 0.5 : 0);
    // return rampup;
    return rampup; // Replace with your calculation
}
function calculateResponsiveness(data) {
    // Calculate responsiveness metric based on the data
    // Example:
    // const responsiveness = data.responsiveness;
    // return responsiveness;
    return (1 / (data.issueRelationTimeInMonths) + 1 / (data.timeSinceLastCommandInMonths)) / 2;
}
function checkLicenseExistence(data) {
    // Check if a specific license exists in the data
    const license = data.license;
    return license === 'LGPLv2.1' ? 1 : 0;
    // Example:
    // const license = data.license;
    // return license === 'MIT';
}
function calculateNetScore(correctness, busFactor, rampup, responsiveness, licenseExistence) {
    // Calculate the net score based on the individual metrics
    // Example:
    // const netScore = correctness + busFactor + rampup + responsiveness;
    // if (licenseExistence) {
    //     netScore += 10;
    //return checkLicenseExistence * ((0.3 * calculateResponsiveness(data)) + (0.25 * calculateCorrectness(data)) + (0.25 * calculateRampup(data)) + (0.2 * calculateBusFactor(data)));
    // return netScore;
    const weightedScore = (0.3 * responsiveness) + (0.25 * correctness) + (0.25 * rampup) + (0.2 * busFactor);
    // If the license exists, multiply by one, otherwise leave out?
    return licenseExistence === 1 ? weightedScore * 1.1 : weightedScore;
}
// Usage example:
const jsonPacket = JSON.stringify({
    openIssues: 5,
    closedIssues: 50,
    activeMembers: 4,
    issueRelationTimeInMonths: 3,
    timeSinceLastCommandInMonths: 2,
    license: "LGPLv2.1",
    linesOfCode: 600, // New field for Rampup calculation
    users: 15000 // New field for Rampup calculation
});
const extractedData = extractMetricData(jsonPacket);
console.log(extractedData);
