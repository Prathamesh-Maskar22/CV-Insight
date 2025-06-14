const express = require('express');
const multer = require('multer');
const Resume = require('../models/Resume');
const resumeParser = require('../services/resumeParser');
const aiAnalyzer = require('../services/aiAnalyzer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const { text, keywords } = await resumeParser.parseResume(req.file.buffer);
    const analysis = aiAnalyzer.analyzeResume(text, keywords);

    const resume = new Resume({
      userId: req.body.userId || 'default_user',
      fileName: req.file.originalname,
      textContent: text,
      keywords,
      analysis
    });

    await resume.save();
    res.json(resume);
  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
});

router.post('/compare-jd', upload.single('jd'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No job description file uploaded' });
    }
    if (!req.body.resumeId) {
      return res.status(400).json({ error: 'Resume ID is required' });
    }

    const resume = await Resume.findById(req.body.resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const jdText = (await resumeParser.parseResume(req.file.buffer)).text;
    const jdComparison = resumeParser.compareWithJD(resume.keywords, jdText);

    resume.jdComparison = jdComparison;
    await resume.save();

    res.json(resume);
  } catch (error) {
    console.error('Error comparing JD:', error);
    res.status(500).json({ error: 'Failed to compare with job description' });
  }
});

module.exports = router;