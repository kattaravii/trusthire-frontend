import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css'; // Importing the Light Glassmorphism theme

export default function Register() {
    const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'company'
    
    // Common fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Student-specific fields
    const [enrollNo, setEnrollNo] = useState('');
    const [university, setUniversity] = useState('');
    
    // Company-specific fields
    const [empId, setEmpId] = useState('');
    const [companyName, setCompanyName] = useState('');

    // OTP-specific states
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otp, setOtp] = useState('');
    const [emailForOtp, setEmailForOtp] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Strict password check
        if (password !== confirmPassword) {
            setError('Passwords do not match. Please re-type your password.');
            return;
        }

        // Build payload dynamically based on role
        const payload = {
            name,
            email,
            password,
            role: selectedRole,
            ...(selectedRole === 'student' && { enrollNo, university }),
            ...(selectedRole === 'company' && { empId, companyName })
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.requiresOtp) {
                    // Switch view to OTP entry screen if company registration triggered it
                    setEmailForOtp(email);
                    setIsOtpStep(true);
                    setSuccess('OTP verification code sent to your company email!');
                } else {
                    setSuccess('Registration successful! Redirecting to login...');
                    setTimeout(() => navigate('/login'), 2000);
                }
            } else {
                setError(data.error || data.message || 'Registration failed.');
            }
        } catch (err) {
            console.error('Register error:', err);
            setError('Failed to connect to the server.');
        }
    };

    // Handle verification of the company OTP code
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://127.0.0.1:5000/api/auth/verify-company-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailForOtp, otp })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                setSuccess('Company verified successfully! Redirecting to dashboard...');
                setTimeout(() => navigate('/company-dashboard'), 1500);
            } else {
                setError(data.error || 'Invalid OTP code.');
            }
        } catch (err) {
            console.error('OTP verification error:', err);
            setError('Failed to verify OTP.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            {/* The Massive White Floating Card */}
            <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '40px', margin: '20px' }}>
                
                <h2 className="page-title" style={{ marginBottom: '25px', textAlign: 'center', fontSize: '28px' }}>
                    {!isOtpStep ? 'Create an Account' : 'Verify Company Email'}
                </h2>

                {/* Sleek Role Switcher Tabs (Only shown during initial registration step) */}
                {!isOtpStep && (
                    <div style={{ display: 'flex', marginBottom: '25px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <button 
                            type="button"
                            onClick={() => { setSelectedRole('student'); setError(''); }}
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
                            onClick={() => { setSelectedRole('company'); setError(''); }}
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
                )}

                {/* Alerts */}
                {error && (
                    <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '0.9em', fontWeight: '500' }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '0.9em', fontWeight: '500' }}>
                        {success}
                    </div>
                )}

                {/* CONDITIONAL RENDER: Step 1 Registration vs Step 2 OTP Screen */}
                {!isOtpStep ? (
                    <form onSubmit={handleRegister}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Full Name</label>
                            <input 
                                type="text" value={name} onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Ravi Katta"
                                className="input-field"
                                required 
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Email Address</label>
                            <input 
                                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder={selectedRole === 'company' ? 'hr@company.com' : 'kattaravi321@gmail.com'}
                                className="input-field"
                                required 
                            />
                        </div>

                        {/* DYNAMIC FIELDS based on selected role */}
                        {selectedRole === 'student' && (
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9em' }}>Enrollment No.</label>
                                    <input 
                                        type="text" value={enrollNo} onChange={(e) => setEnrollNo(e.target.value)}
                                        placeholder="e.g. 21SE02"
                                        className="input-field"
                                        required 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9em' }}>University Name</label>
                                    <input 
                                        type="text" value={university} onChange={(e) => setUniversity(e.target.value)}
                                        placeholder="e.g., PP Savani University"
                                        className="input-field"
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        {selectedRole === 'company' && (
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9em' }}>Employee ID</label>
                                    <input 
                                        type="text" value={empId} onChange={(e) => setEmpId(e.target.value)}
                                        placeholder="e.g. EMP-1042"
                                        className="input-field"
                                        required 
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9em' }}>Company Name</label>
                                    <input 
                                        type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. TechCorp Inc."
                                        className="input-field"
                                        required 
                                    />
                                </div>
                            </div>
                        )}

                        {/* PASSWORDS */}
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '24px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9em' }}>Password</label>
                                <input 
                                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create password"
                                    className="input-field"
                                    required 
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9em' }}>Confirm Password</label>
                                <input 
                                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-type password"
                                    className="input-field"
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Register as {selectedRole === 'company' ? 'Company' : 'Student'}
                        </button>
                    </form>
                ) : (
                    /* --- ENTER OTP SCREEN FOR COMPANIES --- */
                    <form onSubmit={handleVerifyOtp}>
                        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px', fontSize: '0.95em' }}>
                            We have sent a 6-digit verification code to <strong>{emailForOtp}</strong>. This code will expire in 5 minutes.
                        </p>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Verification Code</label>
                            <input 
                                type="text" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                className="input-field"
                                style={{ textAlign: 'center', letterSpacing: '3px', fontSize: '1.2em' }}
                                required 
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                            Verify OTP & Complete Registration
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>
                    Already have an account? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '700' }}>Login here</Link>
                </p>
            </div>
        </div>
    );
}