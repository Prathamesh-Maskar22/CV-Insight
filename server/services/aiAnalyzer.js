const natural = require('natural');

class AIAnalyzer {
  analyzeResume(text, keywords) {
    // Simple scoring based on keyword density and resume length
    const wordCount = text.split(/\s+/).length;
    const keywordDensity = keywords.length / wordCount;
    
    const score = Math.min(100, Math.round(keywordDensity * 1000));
    
    const strengths = [
      wordCount > 300 ? 'Comprehensive content' : 'Concise presentation',
      keywords.length > 20 ? 'Rich keyword usage' : 'Focused skill set'
    ];
    
    const weaknesses = [];
    if (wordCount < 200) weaknesses.push('Resume may be too brief');
    if (keywords.length < 10) weaknesses.push('Limited keyword usage');
    
    const suggestions = [
      'Use action verbs to describe achievements',
      'Quantify results where possible',
      'Tailor content to specific job roles'
    ];

    return { score, strengths, weaknesses, suggestions };
  }
}

module.exports = new AIAnalyzer();