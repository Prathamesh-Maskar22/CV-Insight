import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function ResumeUploader({ setResumeData, setIsLoading, isLoading }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resume file');
      return;
    }

    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('userId', 'default_user'); // Replace with actual user ID

    try {
      console.log('Sending resume upload request to /api/resumes/upload-resume');
      const response = await axios.post('/api/resumes/upload-resume', formData);
      console.log('Resume upload response:', response.data);
      setResumeData(response.data);
      setFile(null); // Clear file input after success
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to upload resume. Please try again.';
      setError(errorMessage);
      console.error('Upload failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setFile(null);
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Resume</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <motion.button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLoading} // ✅ uses the prop now
        >
          {isLoading ? 'Uploading...' : 'Analyze Resume'}
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

export default ResumeUploader;
