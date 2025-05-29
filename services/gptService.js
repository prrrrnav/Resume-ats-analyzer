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
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an ATS resume evaluator.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 700,
  });

  const end = Date.now();
  const durationInSeconds = (end - start) / 1000;  // Duration in seconds
  console.log(`Response time: ${durationInSeconds} seconds`);

  return response.choices[0].message.content;
};

exports.optimizeWithGPT = async (resumeText, jd, goalScore = 95, tone = 'professional and concise') => {
  const prompt = `
Here is the candidate's resume:
---
${resumeText}

Here is the job description:
---
${jd}

You are an expert ATS resume optimizer.

Rewrite and optimize the resume to match the job description using strong action verbs, relevant keywords, and a professional tone and use keywords that are included in job description. The resume should be tailored to score at least ${goalScore}/100 in an ATS scan.

Return the result strictly as a JSON object with the following structure:

{
  "name": "",
  "contact_information": "",
  "technical_skills": "",
  "professional_overview": "",
  "professional_experience": "",
  "projects": "",
  "education": "",
  "awards_and_achievements": ""
}

Each field should be a string. Do NOT include any extra text or explanation. Do NOT wrap in code block. Only return valid JSON.
  `.trim();

  const start = Date.now();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an ATS resume optimizer. You receive a resume and a job description and must return an optimized resume in JSON format using the given fields. Respond only with valid JSON. Do NOT include triple backticks.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1400,
    temperature: 0.3
  });

  const end = Date.now();
  const durationInSeconds = (end - start) / 1000;
  console.log(`Response time: ${durationInSeconds} seconds`);

  let rawContent = response.choices[0].message.content.trim();
  console.log("Raw GPT Response:", rawContent);

  // Remove any wrapping backticks (like ```json or ```), if present
  if (rawContent.startsWith("```")) {
    rawContent = rawContent.replace(/```(?:json)?/g, "").trim();
  }

  // Extract only the JSON part if needed
  const firstBrace = rawContent.indexOf("{");
  const lastBrace = rawContent.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Could not find valid JSON in GPT response.");
  }

  const jsonString = rawContent.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to parse GPT response:", err.message);
    throw new Error("Invalid JSON returned from GPT.");
  }
};


// exports.optimizeWithGPT = async (resumeText, jd, goalScore = 95, tone = 'professional and concise') => {
//   const prompt = `
// Here is the candidate's resume:
// ---
// ${resumeText}

// Here is the job description:
// ---
// ${jd}

// You are an expert ATS resume optimizer.

// Rewrite and optimize the resume to match the job description using strong action verbs, relevant keywords, and a professional tone and use keywords that are included in job description. The resume should be tailored to score at least ${goalScore}/100 in an ATS scan.

// Return the result strictly as a JSON object with the following structure:

// {
//   "name": "",
//   "contact_information": "",
//   "technical_skills": "",
//   "professional_overview": "",
//   "professional_experience": "",
//   "projects": "",
//   "education": "",
//   "awards_and_achievements": ""
// }

// Each field should be a string. Do NOT include any extra text or explanation. Only return valid JSON.
//   `.trim();

//   const start = Date.now();

//   const response = await openai.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [
//       {
//         role: 'system',
//         content: `You are an ATS resume optimizer. You receive a resume and a job description and must return an optimized resume in JSON format using the given fields. Respond only with valid JSON.`
//       },
//       {
//         role: 'user',
//         content: prompt
//       }
//     ],
//     max_tokens: 1400,
//     temperature: 0.3
//   });

//   const end = Date.now();
//   const durationInSeconds = (end - start) / 1000;
//   console.log(`Response time: ${durationInSeconds} seconds`);
//   console.log(response.choices[0].message.content);

//   return JSON.parse(response.choices[0].message.content); // Automatically converts the string into a usable JSON object
// };

// exports.optimizeWithGPT = async (resumeText, jd, goalScore = 95, tone = 'professional and concise') => {
//   const prompt = `
// Here is the candidate's resume:
// ---
// ${resumeText}

// Here is the job description:
// ---
// ${jd}

// Your task is to rewrite and optimize this resume to match the job description above. Ensure the following:
// - Match the tone: ${tone}
// - Use strong action verbs and achievement-oriented language.
// - Include relevant keywords and skills from the job description.
// - Format the resume using ATS-friendly structure: Summary, Skills, Experience, Projects (optional), Education.
// - Avoid fancy symbols, tables, and columns. Use plain text formatting.
// - The final resume should be clean, tailored, and able to score at least ${goalScore}/100 in an ATS scan.

// Return ONLY the final optimized resume as plain text. Do NOT include extra notes, comments, or headings.
// `.trim();

//   const start = Date.now();

//   const response = await openai.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [
//       {
//         role: 'system',
//         content: `
// You are an expert ATS resume optimizer. You receive a resume and a job description. Your job is to optimize the resume using the job's language, skills, and structure to maximize ATS score (at least ${goalScore}/100). Always write in a ${tone} tone. Return only the improved resume in plain text.
//         `.trim()
//       },
//       {
//         role: 'user',
//         content: prompt
//       }
//     ],
//     max_tokens: 1200,
//     temperature: 0.7
//   });

//   const end = Date.now();
//   const durationInSeconds = (end - start) / 1000;
//   console.log(`Response time: ${durationInSeconds} seconds`);
//   console.log(response.choices[0].message.content);

//   return response.choices[0].message.content;
// };
