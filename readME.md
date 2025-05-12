📄 Resume Analyzer API
An AI-powered backend API that analyzes resumes, compares them with job descriptions, returns an ATS score, improvement suggestions, and generates an improved .docx version of the resume.

🧠 Powered by OpenAI (GPT-4)
🚀 Built with Node.js + Express
📦 File upload handled via Multer
📄 Supports .pdf and .docx resumes

📌 Features
Upload a resume and job description

Analyze how well the resume matches the JD

Receive:

ATS Score (match %)

Suggested improvements

Enhanced resume as a downloadable .docx

🚀 Technologies Used
Node.js + Express.js

Multer (file uploads using memory storage)

pdf-parse and mammoth (resume text extraction)

OpenAI API (GPT-4.1)

docx (generate .docx documents)

dotenv (environment variables)

Deployed on Heroku

📁 File Upload Support
.pdf resumes are parsed using pdf-parse

.docx resumes are parsed using mammoth

Other formats are currently not supported

📡 API Routes
🔹 POST /analyze
Description: Upload a resume and provide a job description to get analysis.

Content-Type: multipart/form-data

Request Body:
Field	Type	Description
resume	File	.pdf or .docx resume file
jobDescription	String	Plain text of job description

Example (using Postman):
bash
Copy
Edit
POST /analyze
FormData:
- resume: [upload file]
- jobDescription: "We are looking for a backend developer with Node.js and MongoDB experience..."
Response:
json
Copy
Edit
{
  "atsScore": "78%",
  "suggestions": [
    "Add more keywords related to Node.js and MongoDB",
    "Include specific achievements with metrics"
  ],
  "docxFile": "download_link_here"
}
🔧 Setup Instructions
1. Clone the repo
bash
Copy
Edit
git clone https://github.com/prrrrnav/Resume-ats-analyzer.git
cd Resume-ats-analyzer
2. Install dependencies
bash
Copy
Edit
npm install
3. Set up environment variables
Create a .env file:

ini
Copy
Edit
OPENAI_API_KEY=your_openai_key
PORT=5000
4. Start the server
bash
Copy
Edit
npm start
📌 Deployment
This app is deployed on Heroku. You can deploy it by:

bash
Copy
Edit
git push heroku main
📄 License
MIT License

🙌 Contributing
Contributions, suggestions, and issues are welcome! Feel free to open a PR or issue on GitHub.

🔗 Contact
Made with ❤️ by [Pranav Tiwari]
📧 pranav143010@gmail.com
🔗 [www.linkedin.com/in/prrrranv]