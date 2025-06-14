const pdf = require('pdf-parse');
const natural = require('natural');
const mongoose = require('mongoose');
const Tesseract = require('tesseract.js');

class ResumeParser {
  async parseResume(fileBuffer) {
    try {
      let text;

      // Try PDF parsing first
      try {
        const data = await pdf(fileBuffer);
        text = data.text;
      } catch (pdfError) {
        console.warn('PDF parsing failed, attempting OCR:', pdfError);
        // Fallback to OCR for scanned PDFs
        const { data: { text: ocrText } } = await Tesseract.recognize(fileBuffer, 'eng');
        text = ocrText;
      }

      if (!text || text.trim().length < 50) {
        throw new Error('No usable text extracted from the document');
      }

      // Extract keywords using TF-IDF
      const tfidf = new natural.TfIdf();
      tfidf.addDocument(text);
      const keywords = [];
      tfidf.listTerms(0).forEach(item => {
        if (item.tfidf > 1 && item.term.length > 3) {
          keywords.push(item.term.toLowerCase());
        }
      });

      // Identify resume sections and entities
      const { sections, entities } = this.identifySectionsAndEntities(text);

      return { text, keywords, sections, entities };
    } catch (error) {
      console.error('Parse resume error:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  async parseJD(inputType, fileBuffer, jdText) {
    try {
      let text;

      if (inputType === 'text') {
        text = jdText;
      } else {
        // Try PDF parsing first
        try {
          const data = await pdf(fileBuffer);
          text = data.text;
        } catch (pdfError) {
          console.warn('JD PDF parsing failed, attempting OCR:', pdfError);
          // Fallback to OCR for scanned PDFs
          const { data: { text: ocrText } } = await Tesseract.recognize(fileBuffer, 'eng');
          text = ocrText;
        }
      }

      if (!text || text.trim().length < 50) {
        throw new Error('Job description is too short or no usable text provided');
      }

      // Identify sections and entities (simplified for JD)
      const { sections, entities } = this.identifySectionsAndEntities(text);

      return { text, sections, entities };
    } catch (error) {
      console.error('Parse JD error:', error);
      throw new Error(`Failed to parse job description: ${error.message}`);
    }
  }

  identifySectionsAndEntities(text) {
    const sections = {
      experience: [],
      education: [],
      skills: []
    };
    const entities = {
      roles: [],
      technologies: [],
      achievements: []
    };

    const lines = text.split('\n').map(line => line.trim().toLowerCase());
    let currentSection = null;

    // Common roles and technologies for MERN stack
    const roles = ['developer', 'engineer', 'software', 'full stack', 'frontend', 'backend'];
    const technologies = ['mongodb', 'javascript', 'typescript', 'express', 'react', 'node', 'vite', 'tailwind', 'aws', 'docker', 'jest'];

    lines.forEach(line => {
      // Section detection
      if (line.includes('experience') || line.includes('work history') || line.includes('responsibilities')) {
        currentSection = 'experience';
      } else if (line.includes('education') || line.includes('academic') || line.includes('qualifications')) {
        currentSection = 'education';
      } else if (line.includes('skills') || line.includes('technical skills') || line.includes('requirements')) {
        currentSection = 'skills';
      } else if (line && currentSection) {
        sections[currentSection].push(line);

        // Entity detection
        if (currentSection === 'experience') {
          if (roles.some(role => line.includes(role))) {
            entities.roles.push(line);
          }
          if (line.match(/\b(increased|improved|reduced|achieved|delivered)\b.*\d+/)) {
            entities.achievements.push(line.trim());
          }
        }
        if (currentSection === 'skills' || line.includes('skills')) {
          technologies.forEach(token => {
            if (line.includes(token)) {
              entities.technologies.push(token);
            }
          });
        }
      }
    });

    return { sections, entities };
  }

  async cacheData(data, isResume = true) {
    try {
      const cacheCollection = mongoose.connection.db.collection(isResume ? 'resume_cache' : 'jd_cache');
      await cacheCollection.updateOne(
        { text: data.text },
        { $set: data },
        { upsert: true }
      );
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  async getCachedData(text, isResume = true) {
    try {
      const cacheCollection = mongoose.connection.db.collection(isResume ? 'resume_cache' : 'jd_cache');
      return await cacheCollection.findOne({ text });
    } catch (error) {
      console.error('Get cache error:', error);
      return null;
    }
  }

  compareWithJD(resumeKeywords, jdText) {
    try {
      const tokenizer = new natural.WordTokenizer();
      const jdTokens = tokenizer.tokenize(jdText.toLowerCase()).filter(token => token.length > 3);

      // Extract critical keywords dynamically from JD
      const jdTfidf = new natural.TfIdf();
      jdTfidf.addDocument(jdText);
      const criticalKeywords = [];
      jdTfidf.listTerms(0).forEach(item => {
        if (item.tfidf > 2 && item.term.length > 3) {
          criticalKeywords.push(item.term.toLowerCase());
        }
      });

      // Calculate match score
      let matchCount = 0;
      const missingKeywords = [];
      const jdKeywordCounts = {};

      jdTokens.forEach(token => {
        jdKeywordCounts[token] = (jdKeywordCounts[token] || 0) + 1;
      });

      resumeKeywords.forEach(keyword => {
        if (jdKeywordCounts[keyword]) {
          const weight = criticalKeywords.includes(keyword) ? 2 : 1;
          matchCount += weight;
        }
      });

      jdTokens.forEach(token => {
        if (!resumeKeywords.includes(token) && !missingKeywords.includes(token)) {
          missingKeywords.push(token);
        }
      });

      const totalPossibleMatches = jdTokens.reduce((sum, token) => {
        const weight = criticalKeywords.includes(token) ? 2 : 1;
        return sum + weight;
      }, 0);

      const matchScore = totalPossibleMatches > 0
        ? Math.round((matchCount / totalPossibleMatches) * 100)
        : 0;

      // Generate recommendations
      const recommendations = this.generateRecommendations(missingKeywords, criticalKeywords);

      return {
        matchScore,
        missingKeywords,
        criticalKeywords,
        recommendations
      };
    } catch (error) {
      console.error('JD comparison error:', error);
      throw new Error(`Failed to compare with JD: ${error.message}`);
    }
  }

  generateRecommendations(missingKeywords, criticalKeywords) {
    const recommendations = [];

    // Critical keyword recommendations
    missingKeywords.forEach(keyword => {
      if (criticalKeywords.includes(keyword)) {
        recommendations.push(`Incorporate "${keyword}" (critical skill) into your skills or experience to align with job requirements.`);
      }
    });

    // Section-specific recommendations
    if (missingKeywords.length > 5) {
      recommendations.push('Add more relevant keywords from the job description to improve alignment.');
    }

    return recommendations;
  }
}

module.exports = new ResumeParser();