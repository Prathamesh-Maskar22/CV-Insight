const natural = require('natural');

class AIAnalyzer {
  analyzeResume(text, keywords, sections, entities) {
    try {
      // Calculate comprehensive score
      const score = this.calculateScore(text, keywords, sections, entities);

      // Perform sentiment analysis with fallback
      const sentiment = this.analyzeSentiment(text) || {
        score: 0,
        description: 'Neutral'
      };

      // Identify strengths and weaknesses
      const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(text, keywords, sections, entities);

      // Generate tailored suggestions
      const suggestions = this.generateSuggestions(keywords, sections, entities, sentiment);

      // Cluster skills
      const skillClusters = this.clusterSkills(keywords);

      return { score, strengths, weaknesses, suggestions, sentiment, skillClusters };
    } catch (error) {
      console.error('Resume analysis error:', error);
      return {
        score: 0,
        strengths: [],
        weaknesses: ['Analysis failed due to processing error'],
        suggestions: ['Ensure the resume is a text-based PDF and try again'],
        sentiment: { score: 0, description: 'Not available' },
        skillClusters: {}
      };
    }
  }

  calculateScore(text, keywords, sections, entities) {
    const wordCount = text.split(/\s+/).length;
    const keywordDensity = keywords.length / wordCount;

    // Initialize score components
    let score = 0;

    // Keyword density (20%)
    score += Math.min(20, Math.round(keywordDensity * 200));

    // Section completeness (30%)
    score += this.calculateSectionScore(sections);

    // Action verb usage (20%)
    score += this.calculateActionVerbScore(text);

    // Skill relevance (20%)
    score += this.calculateSkillScore(keywords, entities);

    // Sentiment and achievements (10%)
    score += this.calculateSentimentAndAchievementScore(text, entities);

    return Math.min(100, Math.round(score));
  }

  calculateSectionScore(sections) {
    let score = 0;
    if (sections.experience?.length > 3) score += 15; // Detailed experience
    else if (sections.experience?.length > 0) score += 10; // Basic experience
    if (sections.education?.length > 0) score += 10; // Education present
    if (sections.skills?.length > 5) score += 5; // Comprehensive skills
    return score;
  }

  calculateActionVerbScore(text) {
    const actionVerbs = [
      'developed', 'designed', 'implemented', 'led', 'managed',
      'optimized', 'built', 'collaborated', 'delivered', 'created'
    ];
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const verbCount = tokens.filter(token => actionVerbs.includes(token)).length;
    return Math.min(20, Math.round((verbCount / 10) * 20));
  }

  calculateSkillScore(keywords, entities) {
    const criticalSkills = [
      'mongodb', 'express', 'react', 'node', 'javascript', 'typescript',
      'restful', 'api', 'vite', 'tailwind', 'nosql', 'git', 'aws', 'docker', 'jest'
    ];
    const relevantSkills = keywords.filter(keyword => criticalSkills.includes(keyword));
    const techScore = entities.technologies?.length * 2 || 0;
    return Math.min(20, relevantSkills.length + techScore);
  }

  calculateSentimentAndAchievementScore(text, entities) {
    const sentiment = this.analyzeSentiment(text) || { score: 0 };
    let score = sentiment.score > 0 ? 5 : 2;
    score += entities.achievements?.length * 1 || 0; // 1 point per achievement
    return Math.min(10, score);
  }

  analyzeSentiment(text) {
    try {
      const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
      const tokenizer = new natural.WordTokenizer();
      const tokens = tokenizer.tokenize(text);
      const sentimentScore = analyzer.getSentiment(tokens);
      return {
        score: sentimentScore,
        description: sentimentScore > 0 ? 'Positive' : sentimentScore < 0 ? 'Negative' : 'Neutral'
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return null;
    }
  }

  clusterSkills(keywords) {
    const clusters = {
      frontend: ['react', 'javascript', 'typescript', 'vite', 'tailwind'],
      backend: ['node', 'express', 'mongodb', 'nosql'],
      devops: ['aws', 'docker', 'kubernetes'],
      testing: ['jest', 'mocha', 'cypress']
    };

    const skillClusters = {};
    Object.keys(clusters).forEach(cluster => {
      skillClusters[cluster] = keywords.filter(keyword => clusters[cluster].includes(keyword));
    });

    return skillClusters;
  }

  identifyStrengthsWeaknesses(text, keywords, sections, entities) {
    const strengths = [];
    const weaknesses = [];
    const wordCount = text.split(/\s+/).length;

    // Strengths
    if (wordCount > 300) strengths.push('Comprehensive and detailed content');
    if (keywords.length > 20) strengths.push('Rich use of relevant keywords');
    if (sections.experience?.length > 3) strengths.push('Detailed professional experience');
    if (sections.skills?.length > 5) strengths.push('Strong technical skill set');
    if (entities.achievements?.length > 0) strengths.push('Includes quantifiable achievements');
    if (this.analyzeSentiment(text)?.score > 0) strengths.push('Positive and confident tone');

    // Weaknesses
    if (wordCount < 200) weaknesses.push('Resume content may be too brief');
    if (keywords.length < 10) weaknesses.push('Limited use of relevant keywords');
    if (sections.experience?.length === 0) weaknesses.push('Missing professional experience section');
    if (sections.education?.length === 0) weaknesses.push('Missing education section');
    if (entities.technologies?.length < 3) weaknesses.push('Limited technical skills listed');
    if (entities.achievements?.length === 0) weaknesses.push('Lacks quantifiable achievements');

    return { strengths, weaknesses };
  }

  generateSuggestions(keywords, sections, entities, sentiment) {
    const suggestions = [];

    // General suggestions
    if (keywords.length < 10) {
      suggestions.push('Incorporate more industry-specific keywords to highlight your expertise.');
    }
    if (sections.experience?.length < 2) {
      suggestions.push('Add detailed descriptions of your work experience, focusing on achievements and responsibilities.');
    }
    if (sections.education?.length === 0) {
      suggestions.push('Include your educational background to provide a complete profile.');
    }
    if (entities.technologies?.length < 5) {
      suggestions.push('List additional technical skills, such as MongoDB, React, or Node.js, to strengthen your resume.');
    }

    // Sentiment-based suggestions
    if (sentiment?.score <= 0) {
      suggestions.push('Use more positive and action-oriented language to convey confidence and enthusiasm.');
    }

    // Achievement-based suggestions
    if (entities.achievements?.length === 0) {
      suggestions.push('Add quantifiable achievements (e.g., "increased efficiency by 20%") to demonstrate impact.');
    }

    // Role-based suggestions
    if (entities.roles?.length === 0) {
      suggestions.push('Specify your roles (e.g., "Full Stack Developer") to clarify your professional experience.');
    }

    return suggestions;
  }
}

module.exports = new AIAnalyzer();