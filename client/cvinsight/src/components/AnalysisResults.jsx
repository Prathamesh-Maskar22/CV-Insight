import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

function AnalysisResults({ resumeData }) {
  const { analysis, jdComparison } = resumeData || {};

  // Chart data for skill clusters
  const chartData = {
    labels: ['Frontend', 'Backend', 'DevOps', 'Testing'],
    datasets: [
      {
        label: 'Skills Count',
        data: [
          analysis?.skillClusters?.frontend?.length || 0,
          analysis?.skillClusters?.backend?.length || 0,
          analysis?.skillClusters?.devops?.length || 0,
          analysis?.skillClusters?.testing?.length || 0
        ],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['#1e40af', '#047857', '#b45309', '#b91c1c'],
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of Skills' } },
      x: { title: { display: true, text: 'Skill Categories' } }
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Skill Distribution' }
    }
  };

  if (!analysis) {
    return <div className="bg-white p-6 rounded-xl shadow-lg text-red-600">No analysis data available</div>;
  }

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-lg"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Analysis Results</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800">Resume Analysis</h3>
        <p className="text-gray-700">Score: {analysis.score ?? 'N/A'}/100</p>
        {analysis.sentiment ? (
          <p className="text-gray-700">
            Sentiment: {analysis.sentiment.description ?? 'N/A'} (Score: {analysis.sentiment.score ?? 'N/A'})
          </p>
        ) : (
          <p className="text-gray-700">Sentiment: Not available</p>
        )}
        <h4 className="font-medium mt-4 text-gray-800">Skill Clusters:</h4>
        {analysis.skillClusters && Object.entries(analysis.skillClusters).length > 0 ? (
          <>
            <div className="mb-4">
              <Bar data={chartData} options={chartOptions} />
            </div>
            {Object.entries(analysis.skillClusters).map(([cluster, skills]) => (
              skills.length > 0 && (
                <div key={cluster}>
                  <p className="text-gray-700 capitalize font-medium">{cluster}:</p>
                  <ul className="list-disc pl-5 text-gray-600">
                    {skills.map((skill, i) => <li key={i}>{skill}</li>)}
                  </ul>
                </div>
              )
            ))}
          </>
        ) : (
          <p className="text-gray-600">No skill clusters identified</p>
        )}
        <h4 className="font-medium mt-4 text-gray-800">Strengths:</h4>
        <ul className="list-disc pl-5 text-gray-600">
          {analysis.strengths?.length > 0 ? (
            analysis.strengths.map((s, i) => <li key={i}>{s}</li>)
          ) : (
            <li>No strengths identified</li>
          )}
        </ul>
        <h4 className="font-medium mt-4 text-gray-800">Weaknesses:</h4>
        <ul className="list-disc pl-5 text-gray-600">
          {analysis.weaknesses?.length > 0 ? (
            analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)
          ) : (
            <li>No weaknesses identified</li>
          )}
        </ul>
        <h4 className="font-medium mt-4 text-gray-800">Suggestions:</h4>
        <ul className="list-disc pl-5 text-gray-600">
          {analysis.suggestions?.length > 0 ? (
            analysis.suggestions.map((s, i) => <li key={i}>{s}</li>)
          ) : (
            <li>No suggestions available</li>
          )}
        </ul>
      </div>

      {jdComparison && (
        <div>
          <h3 className="text-lg font-medium text-gray-800">Job Description Match</h3>
          <p className="text-gray-700">Match Score: {jdComparison.matchScore ?? 'N/A'}%</p>
          <h4 className="font-medium mt-4 text-gray-800">Critical Keywords:</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {jdComparison.criticalKeywords?.length > 0 ? (
              jdComparison.criticalKeywords.map((k, i) => <li key={i}>{k}</li>)
            ) : (
              <li>No critical keywords identified</li>
            )}
          </ul>
          <h4 className="font-medium mt-4 text-gray-800">Missing Keywords:</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {jdComparison.missingKeywords?.length > 0 ? (
              jdComparison.missingKeywords.map((k, i) => <li key={i}>{k}</li>)
            ) : (
              <li>No missing keywords</li>
            )}
          </ul>
          <h4 className="font-medium mt-4 text-gray-800">Recommendations:</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {jdComparison.recommendations?.length > 0 ? (
              jdComparison.recommendations.map((r, i) => <li key={i}>{r}</li>)
            ) : (
              <li>No recommendations available</li>
            )}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

export default AnalysisResults;