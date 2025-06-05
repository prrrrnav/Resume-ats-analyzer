import React, { useState } from 'react';
import './OptimizedResume.css';

const OptimizedResume = () => {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [optimizedResume, setOptimizedResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !jobDescription.trim()) {
            setError('Please provide both a resume file and job description');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);

        try {
            const response = await fetch('/api/analyze/generate-optimized-resume', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Optimization failed');

            setOptimizedResume(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="optimized-resume">
            <h2>Resume Optimizer</h2>
            <p className="description">
                Upload your resume and provide a job description to get an optimized version
                tailored to the position.
            </p>

            <form onSubmit={handleSubmit} className="optimization-form">
                <div className="file-input-container">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                        id="resume-file"
                    />
                    <label htmlFor="resume-file" className="file-label">
                        {file ? file.name : 'Choose Resume File'}
                    </label>
                </div>

                <div className="textarea-container">
                    <label htmlFor="job-description">Job Description:</label>
                    <textarea
                        id="job-description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description here..."
                        rows="6"
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Optimizing...' : 'Generate Optimized Resume'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {optimizedResume && (
                <div className="optimization-results">
                    <h3>Optimization Results</h3>
                    <div className="suggestions">
                        <h4>Suggested Improvements:</h4>
                        <ul>
                            {optimizedResume.suggestions?.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="optimized-content">
                        <h4>Optimized Content:</h4>
                        <pre>{optimizedResume.optimizedContent}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OptimizedResume; 