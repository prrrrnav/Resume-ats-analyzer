const { Document, Packer, Paragraph, TextRun } = require('docx');

exports.generateDocxBuffer = async (analysisText) => {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun(analysisText)],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
};