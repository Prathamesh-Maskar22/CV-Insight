import { useState } from 'react';
import axios from 'axios';

function ResumeUploader({ setResumeData }) {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', 'user123'); // Replace with actual user ID

    try {
      const response = await axios.post('/api/resumes/upload', formData);
      setResumeData(response.data);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Analyze Resume
        </button>
      </form>
    </div>
  );
}

export default ResumeUploader;