"use client"; // Mark this as a Client Component 

import { useState } from 'react';

export default function UploadFile() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {  // If no file was selected
      alert('Please select a file.');
      return;
    }

    // Convert the selected file to base64
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
      const base64data = reader.result?.toString().split(',')[1]; // Get base64 part
      console.log('Base64 data:', base64data);
      try {
        // Send the base64-encoded file to the Lambda function
        const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Set the content type to JSON
          },
          body: JSON.stringify({ body: base64data }), // Send base64-encoded data
        });

        // Check if the file was uploaded successfully
        if (response.ok) {
          setUploadStatus('File uploaded successfully!');
        } else {
          const errorData = await response.json();
          setUploadStatus(`Failed to upload file: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadStatus('Error uploading file.');
      }
    };
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="Package Name" style={{ width: '200px' }} />
        <input type="text" placeholder="Author" style={{ width: '200px' }} />
        <input type="text" placeholder="Version" style={{ width: '200px' }} />
        <input type="file" accept=".zip" onChange={handleFileChange} />
        <button type="submit" style={{ alignSelf: 'flex-start' }}>Upload</button>
      </form>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}
