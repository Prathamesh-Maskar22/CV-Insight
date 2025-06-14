const express = require('express');
const multer = require('multer');
const Resume = require('../models/Resume');
const resumeParser = require('../services/resumeParser');
const aiAnalyzer = require('../services/aiAnalyzer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    console.log('Received resume upload request');
    // Check cache first
    const cachedData = await resumeParser.getCachedData(req.file.buffer.toString('utf8'), true);
    let resumeData;
    if (cachedData) {
      resumeData = cachedData;
    } else {
      resumeData = await resumeParser.parseResume(req.file.buffer);
      await resumeParser.cacheData(resumeData, true);
    }

    const { text, keywords, sections, entities } = resumeData;
    const analysis = aiAnalyzer.analyzeResume(text, keywords, sections, entities);

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
    res.status(500).json({ error: 'Failed to process resume: ' + error.message });
  }
});

router.post('/compare-jd', upload.single('jd'), async (req, res) => {
  try {
    const { inputType, resumeId, jdText } = req.body;
    const file = req.file;

    console.log('Received JD comparison request:', { inputType, resumeId, hasFile: !!file, jdTextLength: jdText?.length });

    if (!resumeId) {
      return res.status(400).json({ error: 'Resume ID is required' });
    }
    if (inputType === 'file' && !file) {
      return res.status(400).json({ error: 'No job description file uploaded' });
    }
    if (inputType === 'text' && !jdText?.trim()) {
      return res.status(400).json({ error: 'No job description text provided' });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    let jdData;
    const cacheKey = inputType === 'text' ? jdText : file?.buffer.toString('utf8');
    const cachedData = await resumeParser.getCachedData(cacheKey, false);

    if (cachedData) {
      jdData = cachedData;
    } else {
      jdData = await resumeParser.parseJD(inputType, inputType === 'file' ? file.buffer : null, jdText);
      await resumeParser.cacheData(jdData, false);
    }

    const { text } = jdData;
    const jdComparison = resumeParser.compareWithJD(resume.keywords, text);

    resume.jdComparison = jdComparison;
    await resume.save();

    res.json(resume);
  } catch (error) {
    console.error('Error comparing JD:', error);
    res.status(500).json({ error: 'Failed to compare with job description: ' + error.message });
  }
});

module.exports = router;