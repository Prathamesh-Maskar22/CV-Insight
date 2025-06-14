import { useState } from 'react';
import axios from 'axios';

function JDUploader({ resumeId, setResumeData }) {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('jd', file);
    formData.append('resumeId', resumeId);

    try {
      const response = await axios.post('/api/resumes/compare-jd', formData);
      setResumeData(response.data);
    } catch (error) {
      console.error('JD comparison failed:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Job Description</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Compare with JD
        </button>
      </form>
    </div>
  );
}

export default JDUploader;