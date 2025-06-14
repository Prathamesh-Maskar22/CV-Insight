function AnalysisResults({ resumeData }) {
    const { analysis, jdComparison } = resumeData;
  
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium">Resume Analysis</h3>
          <p className="text-gray-700">Score: {analysis.score}/100</p>
          <h4 className="font-medium mt-2">Strengths:</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          <h4 className="font-medium mt-2">Weaknesses:</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
          <h4 className="font-medium mt-2">Suggestions:</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
  
        {jdComparison && (
          <div>
            <h3 className="text-lg font-medium">Job Description Match</h3>
            <p className="text-gray-700">Match Score: {jdComparison.matchScore}%</p>
            <h4 className="font-medium mt-2">Missing Keywords:</h4>
            <ul className="list-disc pl-5 text-gray-600">
              {jdComparison.missingKeywords.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
            <h4 className="font-medium mt-2">Recommendations:</h4>
            <ul className="list-disc pl-5 text-gray-600">
              {jdComparison.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }
  
  export default AnalysisResults;