import { useState } from 'react';
import ResumeUploader from './components/ResumeUploader.jsx';
import JDUploader from './components/JDUploader.jsx';
import AnalysisResults from './components/AnalysisResults.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { motion } from 'framer-motion';

function App() {
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-extrabold text-center mb-10 text-blue-800">
        AI Resume Analyzer
      </h1>
      <div className="max-w-4xl mx-auto space-y-8">
        <ResumeUploader
          setResumeData={setResumeData}
          setIsLoading={setIsLoading}
          isLoading={isLoading} // ✅ Pass isLoading
        />
        {resumeData && !isLoading && (
          <JDUploader
            resumeId={resumeData._id}
            setResumeData={setResumeData}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />

        )}
        {resumeData && !isLoading && (
          <ErrorBoundary>
            <AnalysisResults resumeData={resumeData} />
          </ErrorBoundary>
        )}
        {isLoading && (
          <motion.div
            className="flex justify-center items-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default App;
