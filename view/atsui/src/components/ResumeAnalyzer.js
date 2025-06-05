import React, { useState } from 'react';
import './ResumeAnalyzer.css';

const ResumeAnalyzer = () => {
    const [file, setFile] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Analysis failed');

            setAnalysis(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="resume-analyzer">
            <h2>Resume Analyzer</h2>
            <form onSubmit={handleSubmit} className="upload-form">
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
                <button type="submit" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Analyze Resume'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {analysis && (
                <div className="analysis-results">
                    <h3>Analysis Results</h3>
                    <pre>{JSON.stringify(analysis, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default ResumeAnalyzer; 