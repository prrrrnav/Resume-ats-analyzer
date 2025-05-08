const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { analyzeWithGPT } = require('../services/gptService');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');

// Function to analyze the resume and generate an analysis
exports.analyzeResume = async (req, res) => {
  try {
    const file = req.file;
    const jobDescription = req.body.jd;
    const format = req.query.format || 'docx'; // default format is docx

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let resumeText = '';

    // Parse the resume file based on its MIME type
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      resumeText = data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      resumeText = result.value;
    } else if (file.mimetype === 'text/plain') {
      resumeText = file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
    
    // Get analysis of the resume using GPT
    const analysis = await analyzeWithGPT(resumeText, jobDescription);

    // If the requested format is 'txt', send the analysis as a text file
    if (format === 'txt') {
      res.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="resume_analysis.txt"',
      });
      return res.send(analysis);
    }

    // Default: return the analysis as a .docx file
    const doc = new Document({
      sections: [
        {
          children: analysis.split('\n').map((line) =>
            new Paragraph({
              children: [new TextRun({ text: line.trim(), font: 'Arial', size: 24 })],
            })
          ),
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="resume_analysis.docx"',
    });

    res.send(buffer);
  } catch (err) {
    console.error('Error analyzing resume:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// New function to generate optimized resume based on the analysis
exports.generateOptimizedResume = async (req, res) => {
  try {
    const file = req.file;
    const jobDescription = req.body.jd;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let resumeText = '';

    // Parse the resume file based on its MIME type
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      resumeText = data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      resumeText = result.value;
    } else if (file.mimetype === 'text/plain') {
      resumeText = file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Ask GPT to return a fully optimized resume, not just analysis
    const optimizedResume = await analyzeWithGPT(resumeText, jobDescription);

    // Create a .docx file from the optimized resume content with improved formatting
    const doc = new Document({
      sections: [
        {
          children: [
            // Title
            new Paragraph({
              text: 'Optimized Resume',
              heading: 'Heading1',
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),

            // Resume Content
            ...optimizedResume.split('\n').map((line) => {
              const trimmed = line.trim();

              if (trimmed.startsWith('-')) {
                return new Paragraph({
                  text: trimmed.substring(1).trim(),
                  bullet: { level: 0 },
                  spacing: { before: 200, after: 200 },
                });
              }

              return new Paragraph({
                children: [
                  new TextRun({
                    text: trimmed,
                    font: 'Arial',
                    size: 24,
                    color: '000000',
                  }),
                ],
                spacing: { before: 200, after: 200 },
              });
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // Send the optimized resume as a .docx file
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="optimized_resume.docx"',
    });

    res.send(buffer);
  } catch (err) {
    console.error('Error generating optimized resume:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
