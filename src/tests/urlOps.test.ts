import { urlAnalysis, parseURLsToArray } from '../tools/urlOps';
import * as fs from 'fs';
import * as https from 'https';
import { IncomingMessage } from 'http';
import { logger } from '../tools/logging';
import { envVars } from '../utils/interfaces';

jest.mock('fs');
jest.mock('https');
jest.mock('readline');
jest.mock('../tools/logging');

describe('urlAnalysis', () => {
    let analysis: urlAnalysis;
    let mockLogger: jest.Mocked<logger>;
    const mockEnvVars: envVars = { token: 'test',
        logLevel: 1,
        logFilePath: './testDir/test.log'
      };

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = new logger(mockEnvVars) as jest.Mocked<logger>;
        analysis = new urlAnalysis(mockEnvVars);
        analysis['logger'] = mockLogger;
    });

    describe('evalUrl', () => {
        it('should return the cleaned GitHub URL if it matches the pattern', async () => {
            const url = 'https://github.com/expressjs/express';
            const result = await analysis.evalUrl(url);
            expect(result).toEqual([0, 'https://github.com/expressjs/express']);
        });

        it('should call getRepositoryUrl if it matches the npm pattern', async () => {
            const url = 'https://www.npmjs.com/package/express';
            const mockRepoUrl = 'https://github.com/expressjs/express';
            jest.spyOn(analysis, 'getRepositoryUrl').mockResolvedValue(mockRepoUrl);

            const result = await analysis.evalUrl(url);
            expect(result).toEqual([0, mockRepoUrl]);
            expect(analysis.getRepositoryUrl).toHaveBeenCalledWith(url);
        });

        it('should return -1 and an empty string if the URL does not match any pattern', async () => {
            const url = 'https://example.com/invalid-url';
            const result = await analysis.evalUrl(url);
            expect(result).toEqual([-1, '']);
        });

        it('should return -1 and an empty string if getRepositoryUrl fails', async () => {
            const url = 'https://www.npmjs.com/package/some-package';
            jest.spyOn(analysis, 'getRepositoryUrl').mockRejectedValue(new Error('Error fetching repository URL'));

            const result = await analysis.evalUrl(url);
            expect(result).toEqual([-1, '']);
            expect(mockLogger.logDebug).toHaveBeenCalledWith('Error fetching repository URL:', expect.any(Error));
        });
    });

    describe('extractPackageName', () => {
        it('should return the package name from a valid npm URL', () => {
            const url = 'https://www.npmjs.com/package/some-package';
            const result = analysis.extractPackageName(url);
            expect(result).toBe('some-package');
        });

        it('should return null for an invalid npm URL', () => {
            const url = 'https://example.com/invalid-url';
            const result = analysis.extractPackageName(url);
            expect(result).toBeNull();
            expect(mockLogger.logDebug).toHaveBeenCalledWith('Invalid npm package URL');
        });
    });
/*
    describe('getRepositoryUrl', () => {
        it('should return the repository URL for a valid npm package URL', async () => {
            const mockUrl = 'https://www.npmjs.com/package/express';
            const result = await analysis.getRepositoryUrl(mockUrl);
            expect(result).toBe('https://github.com/expressjs/express');
        });

        it('should return null if no repository URL is found', async () => {
            const mockUrl = 'https://www.npmjs.com/package/blahblahfakepackage';
            const result = await analysis.getRepositoryUrl(mockUrl);
            expect(result).toBe(null);
        })
    })*/
});
/*
describe('parseURLsToArray', () => {
    let mockReadable: any;
  
    beforeEach(() => {
      // Create a mock readable stream
      const mockData = 'https://example.com\nhttps://another.com\n';
      mockReadable = new (require('stream').Readable)({
        read() {
          this.push(mockData);  // Push the mock data
          this.push(null);      // End of stream
        },
      });
  
      // Mock fs.createReadStream to return the mock readable stream
      jest.spyOn(fs, 'createReadStream').mockReturnValue(mockReadable as any);
    });
  
    afterEach(() => {
      // Restore the mocked fs.createReadStream after each test
      (fs.createReadStream as jest.Mock).mockRestore();
    });
  
    it('should parse URLs from the file and return an array', async () => {
      // Call the function with a mock file path
      const result = await parseURLsToArray('mockFilePath.txt');
      const expectedArray = ['https://example.com', 'https://another.com'];
  
      // Assert that the result matches the expected array
      expect(result).toEqual(expectedArray);
      expect(fs.createReadStream).toHaveBeenCalledWith('mockFilePath.txt');  // Check that the mock was called
    });
  });
*/
