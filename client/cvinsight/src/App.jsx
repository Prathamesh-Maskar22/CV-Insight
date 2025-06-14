import { useState } from 'react';
import ResumeUploader from './components/ResumeUploader.jsx';
import JDUploader from './components/JDUploader.jsx';
import AnalysisResults from './components/AnalysisResults.jsx';

function App() {
  const [resumeData, setResumeData] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">AI Resume Analyzer</h1>
      <div className="max-w-4xl mx-auto space-y-8">
        <ResumeUploader setResumeData={setResumeData} />
        {resumeData && <JDUploader resumeId={resumeData._id} setResumeData={setResumeData} />}
        {resumeData && <AnalysisResults resumeData={resumeData} />}
      </div>
    </div>
  );
}

export default App;