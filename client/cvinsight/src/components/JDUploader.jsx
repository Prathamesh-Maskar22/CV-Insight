import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function JDUploader({ resumeId, setResumeData, setIsLoading, isLoading }) {
  const [inputType, setInputType] = useState('file'); // 'file' or 'text'
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (inputType === 'file' && !file) {
      setError('Please select a job description file');
      return;
    }
    if (inputType === 'text' && !jdText.trim()) {
      setError('Please enter job description text');
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('resumeId', resumeId);
    formData.append('inputType', inputType);

    if (inputType === 'file') {
      formData.append('jd', file);
    } else {
      formData.append('jdText', jdText);
    }

    try {
      console.log('Sending JD comparison request to /api/resumes/compare-jd', { inputType });
      const response = await axios.post('/api/resumes/compare-jd', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('JD comparison response:', response.data);
      setResumeData(response.data);
      setJdText('');
      setFile(null);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to compare job description. Please try again.';
      setError(errorMessage);
      console.error('JD comparison failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setFile(null);
    setJdText('');
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload or Enter Job Description</h2>

      <div className="mb-4">
        <label className="mr-4 text-gray-700 font-medium">Input Method:</label>
        <select
          value={inputType}
          onChange={(e) => {
            setInputType(e.target.value);
            setError(null);
            setFile(null);
            setJdText('');
          }}
          className="border border-gray-300 rounded px-3 py-2 text-gray-700"
        >
          <option value="file">Upload PDF</option>
          <option value="text">Enter Text</option>
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        {inputType === 'file' ? (
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        ) : (
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste or type the job description here..."
            className="w-full h-32 border border-gray-300 rounded p-3 mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}

        <motion.button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Compare with JD'}
        </motion.button>
      </form>

      {error && (
        <motion.div
          className="text-red-500 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p>{error}</p>
          <motion.button
            className="mt-2 bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            onClick={handleRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default JDUploader;
