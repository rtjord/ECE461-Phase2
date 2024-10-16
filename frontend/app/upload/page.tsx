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

    const formData = new FormData();  // Create a new FormData object
    formData.append('file', selectedFile);  // Append the selected file to the FormData object

    try {
      // Send the file to the server
      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });

      // Check if the file was uploaded successfully
      if (response.ok) {
        setUploadStatus('File uploaded successfully!');
      } else {
        setUploadStatus('Failed to upload file.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input type="text" placeholder="Package Name" style={{ width: '200px' }} />
      <input type="text" placeholder="Author" style={{ width: '200px' }} />
      <input type="text" placeholder="Version" style={{ width: '200px' }} />
      <input type="file" onChange={handleFileChange} />
      <button type="submit" style={{ alignSelf: 'flex-start' }}>Upload</button>
      </form>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}