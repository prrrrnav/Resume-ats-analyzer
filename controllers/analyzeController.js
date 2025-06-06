const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { analyzeWithGPT,optimizeWithGPT } = require('../services/gptService');
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx');

exports.analyzeResume = async (req, res) => {
  try {
    const file = req.file;
    const jobDescription = req.body.jd;
    const format = req.query.format || 'txt'; 

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let resumeText = '';

    // Parse the resume file based on its MIME type
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      resumeText = data.text;
      console.log(resumeText);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      resumeText = result.value;
      console.log(resumeText);
    } else if (file.mimetype === 'text/plain') {
      resumeText = file.buffer.toString('utf-8');
      console.log(resumeText);
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
      console.log(analysis);
      return res.status(200).json({ message: 'Resume analyzed successfully', analysis });
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


    const optimizedResume = await optimizeWithGPT(resumeText, jobDescription, 98, 'confident and enthusiastic');

    // Create a .docx file from the optimized resume content with improved formatting
    // const doc = new Document({
    //   sections: [
    //     {
    //       children: [
    //         // Title
    //         new Paragraph({
    //           text: 'Optimized Resume',
    //           heading: 'Heading1',
    //           alignment: AlignmentType.CENTER,
    //           spacing: { after: 300 },
    //         }),

    //         // Resume Content
    //         ...optimizedResume.split('\n').map((line) => {
    //           const trimmed = line.trim();

    //           if (trimmed.startsWith('-')) {
    //             return new Paragraph({
    //               text: trimmed.substring(1).trim(),
    //               bullet: { level: 0 },
    //               spacing: { before: 200, after: 200 },
    //             });
    //           }

    //           return new Paragraph({
    //             children: [
    //               new TextRun({
    //                 text: trimmed,
    //                 font: 'Arial',
    //                 size: 24,
    //                 color: '000000',
    //               }),
    //             ],
    //             spacing: { before: 200, after: 200 },
    //           });
    //         }),
    //       ],
    //     },
    //   ],
    // });

    // const buffer = await Packer.toBuffer(doc);

    // // Send the optimized resume as a .docx file
    // res.set({
    //   'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    //   'Content-Disposition': 'attachment; filename="optimized_resume.docx"',
    // });

    const JsonOptimizedResume = optimizedResume;

    const doc = new Document({
      sections: [
        {
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(0.8),
                        bottom: convertInchesToTwip(0.8),
                        left: convertInchesToTwip(0.8),
                        right: convertInchesToTwip(0.8),
                    },
                },
            },
            children: [
                // --- Start of Name & Contact Section (using a Table) ---
                new Table({
                    rows: [
                        new TableRow({
                            children: [
                                // Left Cell: Name Heading
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE }, // Example: 50% width
                                    children: [
                                        createParagraph([
                                            createTextRun(data.name.toUpperCase(), { // Ensure it's capitalized
                                                size: 40, // Approx 20pt
                                                bold: true,
                                                font: "Calibri Light",
                                                color: "333333",
                                            }),
                                        ], {
                                            alignment: AlignmentType.LEFT,
                                            spacing: { after: 0 }, // No extra space after name
                                        }),
                                    ],
                                    verticalAlign: AlignmentType.CENTER, // Align text vertically in cell
                                    // Hide borders for this cell
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    },
                                }),
                                // Right Cell: Contact Details
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE }, // Example: 50% width
                                    children: [
                                        // You can add these as separate paragraphs, or one multi-line paragraph
                                        createParagraph([
                                            createTextRun(data.contact.phone, { size: 24 }), // 12pt
                                        ], { alignment: AlignmentType.RIGHT, spacing: { after: 50 } }), // Small space between lines

                                        createParagraph([
                                            createTextRun(data.contact.email, { size: 24 }), // 12pt
                                        ], { alignment: AlignmentType.RIGHT, spacing: { after: 50 } }),

                                        // Example for LinkedIn/GitHub with external links
                                        createParagraph([
                                            createTextRun("LinkedIn: ", { size: 24 }),
                                            new docx.ExternalHyperlink({ // Assuming docx is imported, or use ExternalHyperlink directly
                                                children: [createTextRun(data.contact.linkedin.replace('https://', ''), { size: 24, underline: true, color: "0000FF" })],
                                                link: data.contact.linkedin,
                                            }),
                                        ], { alignment: AlignmentType.RIGHT, spacing: { after: 50 } }),

                                        createParagraph([
                                            createTextRun("GitHub: ", { size: 24 }),
                                            new docx.ExternalHyperlink({
                                                children: [createTextRun(data.contact.github.replace('https://', ''), { size: 24, underline: true, color: "0000FF" })],
                                                link: data.contact.github,
                                            }),
                                        ], { alignment: AlignmentType.RIGHT }), // No space after last item
                                    ],
                                    verticalAlign: AlignmentType.CENTER, // Align text vertically in cell
                                    // Hide borders for this cell
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    },
                                }),
                            ],
                        }),
                    ],
                    // Crucially, hide all borders for the table itself
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                    },
                }),
                // --- End of Name & Contact Section ---

                // You would add more sections here
            ],
        },
    ],
    })


    res.send(JsonOptimizedResume);
  } catch (err) {
    console.error('Error generating optimized resume:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
