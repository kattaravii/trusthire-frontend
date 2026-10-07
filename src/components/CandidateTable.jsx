import React, { useState, useEffect } from 'react';

export default function CandidateTable() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                // Grab the secure token from local storage
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setError('You are not logged in.');
                    setLoading(false);
                    return;
                }

                // Add the token to the request headers to pass the backend bouncer
                const response = await fetch('https://trusthire-backend-q77g.onrender.com/api/company/students', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch candidates. Ensure you are logged in as a Company.');
                }
                
                const data = await response.json();
                setCandidates(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    if (loading) return <div>Loading candidate data...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;

    return (
        <div className="candidate-table-container card">
            <h2 style={{ marginBottom: '20px' }}>Available Candidates</h2>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ padding: '15px', borderBottom: '2px solid var(--border)' }}>Name</th>
                        <th style={{ padding: '15px', borderBottom: '2px solid var(--border)' }}>Roll Number</th>
                        <th style={{ padding: '15px', borderBottom: '2px solid var(--border)' }}>ATS Score</th>
                        <th style={{ padding: '15px', borderBottom: '2px solid var(--border)' }}>Trust Score</th>
                        <th style={{ padding: '15px', borderBottom: '2px solid var(--border)' }}>Resume</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.length > 0 ? (
                        candidates.map((student) => (
                            <tr key={student.student_id}>
                                <td style={{ padding: '15px', borderBottom: '1px solid var(--border)' }}>
                                    <strong>{student.full_name}</strong>
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid var(--border)' }}>
                                    {student.university_roll_no || 'Not provided'}
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid var(--border)', color: '#10b981', fontWeight: 'bold' }}>
                                    {student.ats_score || 0}%
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid var(--border)', color: '#f59e0b', fontWeight: 'bold' }}>
                                    {student.trust_score || 0}%
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid var(--border)' }}>
                                    {student.resume_url ? (
                                        <a href={student.resume_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>
                                            View Resume
                                        </a>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>No Resume</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                No candidates found in the database yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}