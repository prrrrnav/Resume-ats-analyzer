import React, { useState, useEffect } from 'react';
import './Status.css';

const BASE_URL = 'https://resume-ats-analyzer.p.rapidapi.com';
const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 50000000000; // 5 seconds
const STATUS_CHECK_INTERVAL = 600000000000; // 1 minute

const Status = () => {
    const [status, setStatus] = useState({ ping: null, status: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Try both authentication methods
    const getAuthHeaders = () => {
        return {
            'Authorization': 'Bearer test-key',
            'X-RapidAPI-Proxy-Secret': 'test-key',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const fetchWithRetry = async (url, retryCount = 0) => {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders(),
                mode: 'cors'
            });

            // Handle rate limiting
            if (response.status === 429 && retryCount < MAX_RETRIES) {
                const retryAfter = response.headers.get('Retry-After') ||
                    Math.pow(2, retryCount) * INITIAL_RETRY_DELAY;

                console.log(`Rate limited. Retrying after ${retryAfter}ms...`);
                await delay(retryAfter);
                return fetchWithRetry(url, retryCount + 1);
            }

            // Handle unauthorized errors
            if (response.status === 401 || response.status === 403) {
                throw new Error('Authentication failed. Please check your API credentials.');
            }

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
            }

            return response.json();
        } catch (error) {
            if (retryCount < MAX_RETRIES && error.message.includes('Rate limited')) {
                const retryDelay = Math.pow(2, retryCount) * INITIAL_RETRY_DELAY;
                console.log(`Request failed. Retrying after ${retryDelay}ms...`);
                await delay(retryDelay);
                return fetchWithRetry(url, retryCount + 1);
            }
            throw error;
        }
    };

    useEffect(() => {
        let mounted = true;
        let intervalId = null;

        const checkStatus = async () => {
            if (!mounted) return;

            setLoading(true);
            setError(null);

            try {
                const [pingData, statusData] = await Promise.all([
                    fetchWithRetry(`${BASE_URL}/api/test/ping`),
                    fetchWithRetry(`${BASE_URL}/api/test/status`)
                ]);

                if (!mounted) return;

                setStatus({
                    ping: pingData,
                    status: statusData
                });
                setRetryCount(0); // Reset retry count on success
            } catch (err) {
                if (!mounted) return;

                console.error('API Error Details:', {
                    message: err.message,
                    stack: err.stack
                });
                setError(`Failed to fetch API status: ${err.message}`);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        checkStatus();

        // Only set up interval if initial request succeeds
        if (!error) {
            intervalId = setInterval(checkStatus, STATUS_CHECK_INTERVAL);
        }

        return () => {
            mounted = false;
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [error]);

    return (
        <div className="status-container">
            <h2>API Status</h2>

            {loading && (
                <div className="loading">
                    {retryCount > 0 ?
                        `Rate limited. Retrying attempt ${retryCount}/${MAX_RETRIES}...` :
                        'Checking API status...'}
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                    {retryCount > 0 && <div>Retry attempt: {retryCount}/{MAX_RETRIES}</div>}
                </div>
            )}

            {!loading && !error && (
                <div className="status-grid">
                    <div className="status-card">
                        <h3>Ping Status</h3>
                        <div className={`status-indicator ${status.ping?.status === 'ok' ? 'healthy' : 'unhealthy'}`}>
                            {status.ping?.status === 'ok' ? '✓' : '✗'}
                        </div>
                        <p>{status.ping?.message}</p>
                    </div>

                    <div className="status-card">
                        <h3>API Status</h3>
                        <div className={`status-indicator ${status.status?.status ? 'healthy' : 'unhealthy'}`}>
                            {status.status?.status ? '✓' : '✗'}
                        </div>
                        <p>{status.status?.status}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Status; 