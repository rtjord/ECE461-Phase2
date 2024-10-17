// app/package/DownloadButton.tsx

'use client'; // Mark this file as a Client Component

import React from 'react';

const DownloadButton = ({ packageData }: { packageData: { name: string } }) => {
    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([JSON.stringify(packageData, null, 2)], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = `${packageData.name}.json`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    };

    return (
        <button onClick={handleDownload}>Download Package Info</button>
    );
};

export default DownloadButton;
