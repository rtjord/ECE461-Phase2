// app/package/[packageName]/page.tsx

import React from 'react';
import DownloadButton from './downloadButton'; // Import the Client Component

// Server component
const PackageDetailPage = async ({ params }: { params: { packageName: string } }) => {
    const { packageName } = params;
    const decodedPackageName = decodeURIComponent(packageName);

    // Fake the package data
    const packageData = {
        name: decodedPackageName,
        version: '1.0.0',
        description: 'This is a fake package description for ' + decodedPackageName,
    };

    // Render the package details
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'left' }}>
            <div>
                <h1>Package: {packageData.name}</h1>
                <p>Version: {packageData.version}</p>
                <p>Description: {packageData.description}</p>
                {/* Use the Client Component here */}
                <DownloadButton packageData={packageData} />
            </div>
        </div>
    );
};

export default PackageDetailPage;
