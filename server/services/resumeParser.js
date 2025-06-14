const pdf = require('pdf-parse');
const natural = require('natural');

class ResumeParser {
  async parseResume(fileBuffer) {
    const data = await pdf(fileBuffer);
    const text = data.text;
    
    // Extract keywords using TF-IDF
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text);
    const keywords = [];
    tfidf.listTerms(0).forEach(item => {
      if (item.tfidf > 1) keywords.push(item.term);
    });

    return { text, keywords };
  }

  compareWithJD(resumeKeywords, jdText) {
    const tokenizer = new natural.WordTokenizer();
    const jdTokens = tokenizer.tokenize(jdText.toLowerCase());
    
    const missingKeywords = jdTokens.filter(
      token => !resumeKeywords.includes(token) && token.length > 3
    );
    
    const matchScore = Math.round(
      (resumeKeywords.length - missingKeywords.length) / resumeKeywords.length * 100
    );

    return {
      matchScore,
      missingKeywords,
      recommendations: this.generateRecommendations(missingKeywords)
    };
  }

  generateRecommendations(missingKeywords) {
    return missingKeywords.map(keyword => 
      `Consider adding experience or skills related to "${keyword}" to better match the job description.`
    );
  }
}

module.exports = new ResumeParser();