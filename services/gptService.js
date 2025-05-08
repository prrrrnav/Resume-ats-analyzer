const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.analyzeWithGPT = async (resumeText, jd) => {
  const prompt = `Given the following resume and job description, please evaluate the ATS (Applicant Tracking System) score out of 100. The evaluation should be based on the following criteria:
1. **Skills Match**: Assess how closely the skills in the resume align with those mentioned in the job description. Rate the skills match and suggest improvements for skills that are missing or not emphasized enough.
2. **Experience**: Analyze the experience section and determine how well it matches the job requirements. Highlight any relevant experience and suggest additional experience or responsibilities that should be included.
3. **Education**: Evaluate the educational background in relation to the job. If there are relevant certifications or courses not mentioned in the resume, suggest adding them.
4. **Certifications and Achievements**: Look for certifications or achievements that add value to the resume in relation to the job description. Recommend any relevant certifications the candidate could pursue.
5. **Formatting and Readability**: Evaluate the formatting and structure of the resume. Provide suggestions on how to make the resume more ATS-friendly, such as using appropriate headings, clear section titles, and consistent formatting.
6. **Keywords**: Ensure that the resume uses relevant keywords from the job description. If any important keywords are missing, recommend including them.

### **ATS Score**: The score should be out of 100, based on how well the resume matches the job description in all areas.

### **Suggestions for Improvement**: Provide specific recommendations for improving the resume to make it more ATS-friendly. This could include adding missing skills, restructuring sections, or highlighting relevant experience.

**Resume:**
${resumeText}

**Job Description:**
${jd}`;

  const start = Date.now(); 

  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // ✅ Correct model name
    messages: [
      { role: 'system', content: 'You are an ATS resume evaluator.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 500,
  });

  const end = Date.now();
  const durationInSeconds = (end - start) / 1000;  // Duration in seconds
  console.log(`Response time: ${durationInSeconds} seconds`);
  
  return response.choices[0].message.content;
};
