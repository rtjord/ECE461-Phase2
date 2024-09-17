import * as https from 'https';

export class urlAnalysis {
    async evalUrl(url: string): Promise<[number, string]> {
        const npmPattern = /^https:\/\/www\.npmjs\.com\/package\/[\w-]+$/;
        const gitPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+$/;
    
        if (gitPattern.test(url)) {
            return [0, url];
        } else if (npmPattern.test(url)) {
            try {
                const repoUrl = await this.getRepositoryUrl(url);
                return [0, repoUrl || ''];  // Ensure we return an empty string if repoUrl is null
            } catch (error) {
                console.error('Error fetching repository URL:', error);
                return [-1, ''];  // Return error code and empty string on failure
            }
        } else {
            return [-1, ''];
        }
    }

    extractPackageName(url: string): string | null {
        const npmPattern = /^https:\/\/www\.npmjs\.com\/package\/[\w-]+$/;
        if (npmPattern.test(url)) {
          const parts = url.split('/');
          return parts[parts.length - 1];  // Get the last part of the URL
        } else {
          console.error('Invalid npm package URL');
          return null;
        }
    }

    async getRepositoryUrl(url: string): Promise<string | null> {
        const packageName = this.extractPackageName(url);
        if (!packageName) {
            return null;  // Return null if package name extraction fails
        }

        const registryUrl = `https://registry.npmjs.org/${packageName}`;

        return new Promise((resolve, reject) => {
            https.get(registryUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const packageData = JSON.parse(data);
                        // Check if repository field exists and return the URL
                        if (packageData.repository && packageData.repository.url) {
                            let repoUrl = packageData.repository.url;
                            // Remove 'git+' scheme if present
                            repoUrl = repoUrl.replace(/^git\+/, '');
                            // Convert SSH URLs to HTTPS
                            repoUrl = repoUrl.replace(/^ssh:\/\/git@github\.com/, 'https://github.com/');
                            console.log('Cleaned Repository URL:', repoUrl);
                            resolve(repoUrl);
                        } else {
                            resolve(null);  // No repository URL found
                        }
                    } catch (err) {
                        reject('Error parsing npm registry data: ' + err);
                    }
                });
            }).on('error', (err) => {
                reject('Error fetching data from npm registry: ' + err);
            });
        });
    }
}
