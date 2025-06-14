const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: String,
  fileName: String,
  textContent: String,
  keywords: [String],
  analysis: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String]
  },
  jdComparison: {
    matchScore: Number,
    missingKeywords: [String],
    recommendations: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', ResumeSchema);