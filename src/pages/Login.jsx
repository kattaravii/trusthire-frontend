import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css'; // Importing the Light Glassmorphism theme

export default function Login() {
    const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'company'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Using 127.0.0.1 instead of localhost to prevent the connection bug!
            const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Save session details
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);

                // Verify if the user logged into the correct portal type
                if (data.role && data.role.toLowerCase() === 'company') {
                    navigate('/company');
                } else {
                    navigate('/student');
                }
            } else {
                setError(data.error || 'Login failed.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to connect to the server.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            {/* The Massive White Floating Card from the theme */}
            <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '40px', margin: '20px' }}>
                
                <h2 className="page-title" style={{ marginBottom: '25px', textAlign: 'center', fontSize: '28px' }}>
                    Log in to TrustHire AI
                </h2>

                {/* Sleek Role Switcher Tabs */}
                <div style={{ display: 'flex', marginBottom: '25px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <button 
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                            backgroundColor: selectedRole === 'student' ? '#ffffff' : 'transparent',
                            color: selectedRole === 'student' ? '#3b82f6' : '#64748b',
                            fontWeight: 'bold', cursor: 'pointer',
                            boxShadow: selectedRole === 'student' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🎓 Student
                    </button>
                    <button 
                        type="button"
                        onClick={() => setSelectedRole('company')}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                            backgroundColor: selectedRole === 'company' ? '#ffffff' : 'transparent',
                            color: selectedRole === 'company' ? '#3b82f6' : '#64748b',
                            fontWeight: 'bold', cursor: 'pointer',
                            boxShadow: selectedRole === 'company' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🏢 Company
                    </button>
                </div>

                {error && (
                    <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.9em', fontWeight: '500' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>
                            {selectedRole === 'company' ? 'Company Email Address' : 'Student Email Address'}
                        </label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={selectedRole === 'company' ? 'hr@company.com' : 'student@gmail.com'}
                            className="input-field"
                            required 
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="input-field"
                            required 
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Log In as {selectedRole === 'company' ? 'Company' : 'Student'}
                    </button>
                </form>

                <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '700' }}>Register here</Link>
                </p>
            </div>
        </div>
    );
}