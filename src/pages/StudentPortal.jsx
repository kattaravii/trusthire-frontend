import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function StudentPortal() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [studentData, setStudentData] = useState(null);
    const [availableJobs, setAvailableJobs] = useState([]); 
    const [selectedRole, setSelectedRole] = useState('');
    const [applyStatus, setApplyStatus] = useState('');
    const [myApplications, setMyApplications] = useState([]);
    
    const [editProfile, setEditProfile] = useState({ fullName: '', universityRollNo: '', mobileNumber: '', location: '', yearOfStudy: '3rd Year' });
    const [profileMsg, setProfileMsg] = useState('');

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [emailStatus, setEmailStatus] = useState(''); 
    const [chatMessages, setChatMessages] = useState([{ role: 'bot', text: 'Hello! I am TCU, your TrustHire AI Mentor. Ask me anything about your resume, career roadmap, or interview prep!' }]);

    const [isDsaModalOpen, setIsDsaModalOpen] = useState(false);
    const [dsaEmailStatus, setDsaEmailStatus] = useState('');

    const [showTcuAuthModal, setShowTcuAuthModal] = useState(false);
    const [tcuOtp, setTcuOtp] = useState('');
    const [tcuAuthMsg, setTcuAuthMsg] = useState('');

    const [prepData, setPrepData] = useState(null);
    const [isPrepLoading, setIsPrepLoading] = useState(false);

    const navigate = useNavigate();

    const fetchMyApplications = async (token) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/student/my-applications`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setMyApplications(await res.json());
        } catch (err) { console.error("Error fetching applications:", err); }
    };

    useEffect(() => {
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('token');
        if (!role || role.trim().toLowerCase() !== 'student' || !token) {
            navigate('/login');
            return;
        }

        const fetchProfileAndJobs = async () => {
            try {
                const profileRes = await fetch(`http://127.0.0.1:5000/api/student/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setStudentData(data);
                    setEditProfile({ fullName: data.full_name || '', universityRollNo: data.university_roll_no || '', mobileNumber: data.mobile_number || '', location: data.location || '', yearOfStudy: data.year_of_study || '3rd Year' });
                }

                const jobsRes = await fetch(`http://127.0.0.1:5000/api/student/jobs`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (jobsRes.ok) {
                    const jobsData = await jobsRes.json();
                    setAvailableJobs(jobsData);
                    if (jobsData.length > 0) setSelectedRole(jobsData[0].title);
                }

                fetchMyApplications(token);
            } catch (err) { console.error(err); }
        };
        fetchProfileAndJobs();
    }, [navigate]);

    const handleFileChange = (e) => { setFile(e.target.files[0]); setUploadStatus(''); };

    const handleUpload = async () => {
        if (!file) return;
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('resume', file);
        try {
            setUploadStatus('🧠 Uploading and analyzing file via Groq AI...');
            const response = await fetch('http://127.0.0.1:5000/api/student/upload-resume', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            const data = await response.json();
            if (response.ok) {
                setUploadStatus('Success! AI Analysis Complete. Check your Career Guidance tab!');
                setFile(null); 
                const updatedResponse = await fetch(`http://127.0.0.1:5000/api/student/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (updatedResponse.ok) setStudentData(await updatedResponse.json());
            } else setUploadStatus(`Error: ${data.error}`);
        } catch (err) { setUploadStatus('Failed to connect to the server.'); }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const fixedCompanyEmail = 'kattaravi321@gmail.com'; 
        try {
            const response = await fetch('http://127.0.0.1:5000/api/student/apply', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ appliedRole: selectedRole, companyEmail: fixedCompanyEmail }) });
            const data = await response.json();
            if (response.ok) { setApplyStatus('Success! Application sent and emails delivered.'); fetchMyApplications(token); }
            else setApplyStatus(`Error: ${data.error}`);
        } catch (err) { setApplyStatus('Failed to submit application.'); }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/student/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(editProfile) });
            if (response.ok) {
                setProfileMsg('Profile updated successfully! ✅');
                const updatedResponse = await fetch(`http://127.0.0.1:5000/api/student/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (updatedResponse.ok) setStudentData(await updatedResponse.json());
            } else setProfileMsg('Failed to update profile. (Check database columns)');
        } catch (err) { setProfileMsg('Server error. Please try again.'); }
        setTimeout(() => setProfileMsg(''), 3000);
    };

    const handleSendTcuOtpFromSettings = async () => {
        setTcuAuthMsg('Sending OTP...');
        setShowTcuAuthModal(true); 
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/student/tcu/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ email: studentData.email }) });
            if (response.ok) setTcuAuthMsg('OTP sent to your email.');
            else setTcuAuthMsg('Failed to send OTP. Try again.');
        } catch (err) { setTcuAuthMsg('Network error.'); }
    };

    const handleVerifyTcuOtp = async (e) => {
        e.preventDefault();
        setTcuAuthMsg('Verifying...');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/student/tcu/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ otp: tcuOtp, mobile: editProfile.mobileNumber || studentData.mobile_number || '', year: editProfile.yearOfStudy || studentData.year_of_study || '' }) });
            if (response.ok) {
                setStudentData({ ...studentData, tcu_verified: true });
                setShowTcuAuthModal(false); setTcuOtp(''); setTcuAuthMsg('');
                setProfileMsg('Account verified successfully! ✅'); setTimeout(() => setProfileMsg(''), 3000);
            } else setTcuAuthMsg('Invalid OTP. Please check your email.');
        } catch (err) { setTcuAuthMsg('Network error.'); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        const userText = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
        setChatInput(''); setIsChatLoading(true);

        try {
            const token = localStorage.getItem('token');
            let apiMessage = userText;
            let studentContext = null;
            if (studentData) {
                studentContext = { skills: studentData.skills || 'Not specified', missing_skills: studentData.missing_skills || 'None identified', recommended_projects: studentData.recommended_projects || 'None' };
                apiMessage = `[SYSTEM NOTE: You are TCU Mentor. The user has already uploaded their resume. Extracted skills: ${studentContext.skills}. Missing skills: ${studentContext.missing_skills}.]\n\nUser Question: ${userText}`;
            }
            const geminiHistory = chatMessages.slice(1).map(msg => ({ role: msg.role === 'bot' ? 'model' : 'user', parts: [{ text: msg.text }] }));

            const res = await fetch('http://127.0.0.1:5000/api/chatbot/ask', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ message: apiMessage, context: studentContext, history: geminiHistory }) });
            const data = await res.json();
            if (res.ok) setChatMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
            else setChatMessages(prev => [...prev, { role: 'bot', text: data.error || 'Oops, something went wrong.' }]);
        } catch (err) { setChatMessages(prev => [...prev, { role: 'bot', text: 'Network error.' }]); } 
        finally { setIsChatLoading(false); }
    };

    const handleEmailChat = async () => {
        setEmailStatus('sending');
        try {
            const res = await fetch('http://127.0.0.1:5000/api/chatbot/email-chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ chatHistory: chatMessages }) });
            if (res.ok) setEmailStatus('success'); else setEmailStatus('error');
        } catch (err) { setEmailStatus('error'); }
        setTimeout(() => setEmailStatus(''), 3000);
    };

    const handleRequestDsaSheet = async () => {
        setDsaEmailStatus('Sending...');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/student/send-dsa-sheet', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            if (response.ok) { setDsaEmailStatus('Success! Check your email inbox. ✅'); setTimeout(() => { setIsDsaModalOpen(false); setDsaEmailStatus(''); }, 2000); }
            else setDsaEmailStatus('Failed to send email. ❌');
        } catch (err) { setDsaEmailStatus('Network error. ❌'); }
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const formatMessage = (text) => {
        if (!text) return { __html: '' };
        let formattedText = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; font-weight: bold; color: inherit;">$1</a>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />');
        return { __html: formattedText };
    };

    const missingSkills = studentData && studentData.missing_skills && studentData.missing_skills !== 'N/A' ? studentData.missing_skills.split(', ') : ['Upload a resume to get AI skill recommendations!'];
    const recommendedProjects = studentData && studentData.recommended_projects && studentData.recommended_projects !== 'N/A' ? studentData.recommended_projects.split(' | ') : ['Upload a resume to get AI project recommendations!'];

    return (
        <div className="app-layout">
            <div className="sidebar-container">
                <h2 className="sidebar-title">TrustHire AI</h2>
                <div className="nav-links-wrapper">
                    <button className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
                    <button className={`sidebar-btn ${activeTab === 'career-guidance' ? 'active' : ''}`} onClick={() => setActiveTab('career-guidance')}>🚀 Career Guidance</button>
                    <button className={`sidebar-btn ${activeTab === 'resumes' ? 'active' : ''}`} onClick={() => setActiveTab('resumes')}>📄 My Resumes</button>
                    <button className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>⚙️ Settings</button>
                    <button className="sidebar-logout" onClick={handleLogout}>🚪 Logout</button>
                </div>
            </div>
            
            <div className="page-container">
                {activeTab === 'dashboard' && (
                    <div>
                        <div className="page-header">
                            <h1 className="page-title" style={{ color: '#ffffff' }}>Student Dashboard</h1>
                            {studentData && <p className="page-subtitle" style={{ color: '#cbd5e1' }}>Welcome back, {studentData.full_name} 👋</p>}
                        </div>
                        
                        <div className="card">
                            <h3 style={{ color: '#ffffff', fontWeight: '800' }}>Upload New Resume</h3>
                            <div style={{ border: '2px dashed rgba(255,255,255,0.2)', padding: '50px', textAlign: 'center', borderRadius: '16px', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }} onClick={() => document.getElementById('file-upload').click()}>
                                <p style={{ fontWeight: '700', color: '#cbd5e1' }}>☁️ Drag & Drop your PDF here or click to browse</p>
                                <input type="file" id="file-upload" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                            </div>
                            {file && (
                                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                                    <p style={{ marginBottom: '10px', color: '#34d399', fontWeight: '700' }}><strong>Selected:</strong> {file.name}</p>
                                    <button onClick={handleUpload} className="btn-primary">Confirm & Analyze via AI</button>
                                </div>
                            )}
                            {uploadStatus && <p style={{ marginTop: '15px', color: uploadStatus.includes('Error') || uploadStatus.includes('Failed') ? '#f87171' : '#38bdf8', fontWeight: '700' }}>{uploadStatus}</p>}
                        </div>

                        <div className="card">
                            <h3 style={{ color: '#ffffff', fontWeight: '800' }}>Available Live Job Openings</h3>
                            <p style={{ color: '#cbd5e1', marginBottom: '15px', fontWeight: '500' }}>Roles posted by companies in real-time:</p>
                            {availableJobs.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No active jobs posted by companies yet.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px' }}>
                                    {availableJobs.map((job) => (
                                        <li key={job.job_id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', marginBottom: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <div style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8', marginBottom: '10px' }}>💼 {job.title}</div>
                                            <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#cbd5e1', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>📍 {job.location || 'Not Disclosed'}</span>
                                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>💰 {job.salary || 'Not Disclosed'}</span>
                                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>⏱️ {job.experience || 'Fresher'}</span>
                                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>🏢 {job.expectedZone || job.expected_zone || 'On-site'}</span>
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#94a3b8' }}><strong style={{ color: '#f8fafc' }}>Required Skills: </strong>{job.skills || job.required_skills || 'General Requirements'}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <h3 style={{ color: '#ffffff', fontWeight: '800', marginTop: '20px' }}>Apply for a Job Role</h3>
                            <form onSubmit={handleApply} style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <select className="input-field" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} style={{ flex: 1, fontWeight: '600' }}>
                                    {availableJobs.length === 0 ? <option value="">No jobs available</option> : availableJobs.map((job) => <option key={job.job_id} value={job.title}>{job.title}</option>)}
                                </select>
                                <button type="submit" className="btn-primary" disabled={availableJobs.length === 0}>Submit Application</button>
                            </form>
                            {applyStatus && <p style={{ marginTop: '15px', color: applyStatus.includes('Success') ? '#34d399' : '#f87171', fontWeight: '700' }}>{applyStatus}</p>}

                            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 style={{ color: '#ffffff', fontWeight: '800', marginBottom: '15px' }}>My Applications History</h3>
                                {myApplications.length === 0 ? (
                                    <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>You haven't applied to any jobs yet.</p>
                                ) : (
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {myApplications.map((app) => (
                                            <li key={app.application_id} style={{ background: 'rgba(255,255,255,0.02)', padding: '15px 20px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ fontWeight: '700', color: '#cbd5e1', fontSize: '15px' }}>💼 {app.applied_role}</div>
                                                <div style={{ background: app.status === 'Low Risk' || app.status === 'Accepted' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(251, 191, 36, 0.1)', color: app.status === 'Low Risk' || app.status === 'Accepted' ? '#34d399' : '#fbbf24', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>{app.status || 'Pending'}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'career-guidance' && (
                    <div>
                        <div className="page-header">
                            <h1 className="page-title" style={{ color: '#ffffff' }}>Career Guidance & Upskilling</h1>
                            <p className="page-subtitle" style={{ color: '#cbd5e1' }}>AI-recommended paths based on your resume analysis</p>
                        </div>
                        <div className="dashboard-grid">
                            <div className="card">
                                <h3 style={{ color: '#38bdf8', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', fontWeight: '800' }}>📚 AI Identified Missing Skills</h3>
                                <ul style={{ listStyle: 'none', marginTop: '15px', lineHeight: '2', color: '#f8fafc', fontWeight: '600' }}>
                                    {missingSkills.map((skill, index) => <li key={index}>🎯 <strong>{skill}</strong></li>)}
                                </ul>
                            </div>
                            <div className="card">
                                <h3 style={{ color: '#c084fc', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', fontWeight: '800' }}>🚀 AI Suggested Projects</h3>
                                <ul style={{ listStyle: 'none', marginTop: '15px', lineHeight: '2', color: '#f8fafc', fontWeight: '600' }}>
                                    {recommendedProjects.map((project, index) => <li key={index}>💻 <strong>{project}</strong></li>)}
                                </ul>
                            </div>
                        </div>

                        {/* --- FAST INTERVIEW TOPICS GENERATOR --- */}
                        <div className="card" style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ color: '#ffffff', fontWeight: '800' }}>🎯 AI Interview Topics Generator</h3>
                                {!prepData && !isPrepLoading && (
                                    <button 
                                        className="btn-primary" 
                                        onClick={async () => {
                                            setIsPrepLoading(true);
                                            try {
                                                const res = await fetch('http://127.0.0.1:5000/api/student/generate-prep', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
                                                const data = await res.json();
                                                // Check that data successfully returned the arrays before setting
                                                if (res.ok && data.important_topics) {
                                                    setPrepData(data);
                                                } else {
                                                    alert("Network error trying to reach AI. Please try again.");
                                                }
                                            } catch (err) { console.error(err); }
                                            setIsPrepLoading(false);
                                        }}
                                    >
                                        Get Interview Topics
                                    </button>
                                )}
                            </div>

                            {isPrepLoading && <p style={{ color: '#38bdf8', marginTop: '15px' }}>🧠 AI is analyzing your resume to extract key interview topics...</p>}

                            {prepData && !isPrepLoading && (
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '30px' }}>
                                        <h4 style={{ color: '#38bdf8', marginBottom: '15px' }}>⭐ Important Topics to Study</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                            {prepData.important_topics?.map((topic, i) => (
                                                <span key={i} style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)', color: '#f8fafc', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '800', border: '1px solid rgba(56, 189, 248, 0.5)' }}>{topic}</span>
                                            ))}
                                            {(!prepData.important_topics || prepData.important_topics.length === 0) && <span style={{color: '#94a3b8'}}>No topics generated.</span>}
                                        </div>
                                    </div>
                                    <h4 style={{ color: '#c084fc', marginBottom: '15px' }}>Top Predicted Interview Questions</h4>
                                    <ul style={{ color: '#cbd5e1', lineHeight: '1.8', marginBottom: '25px', background: 'rgba(255,255,255,0.01)', padding: '20px 20px 20px 40px', borderRadius: '12px' }}>
                                        {prepData.interview_questions?.map((q, i) => <li key={i} style={{ marginBottom: '10px' }}><strong>Q:</strong> {q}</li>)}
                                        {(!prepData.interview_questions || prepData.interview_questions.length === 0) && <li style={{color: '#94a3b8', listStyle: 'none'}}>No questions generated.</li>}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'resumes' && (
                    <div>
                        <div className="page-header">
                            <h1 className="page-title" style={{ color: '#ffffff' }}>My Resumes</h1>
                            <p className="page-subtitle" style={{ color: '#cbd5e1' }}>Manage your uploaded documents and view AI metrics</p>
                        </div>
                        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            {studentData && studentData.resume_url ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '25px' }}>
                                        <div><h4 style={{ fontSize: '18px', color: '#ffffff', fontWeight: '800' }}>📄 Primary Resume</h4></div>
                                        <a href={studentData.resume_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>👁️ View Document</a>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ color: '#38bdf8', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            🤖 AI Resume Metrics
                                        </h4>
                                        
                                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                                            <div style={{ flex: 1, background: 'rgba(52, 211, 153, 0.1)', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                                                <div style={{ fontSize: '28px', fontWeight: '800', color: '#34d399', marginBottom: '4px' }}>{studentData.ats_score || 0}%</div>
                                                <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>ATS Score</div>
                                            </div>
                                            <div style={{ flex: 1, background: 'rgba(192, 132, 252, 0.1)', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
                                                <div style={{ fontSize: '28px', fontWeight: '800', color: '#c084fc', marginBottom: '4px' }}>{studentData.trust_score || 0}%</div>
                                                <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Trust Score</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>
                                                Extracted Core Skills
                                            </div>
                                            <div style={{ color: '#f8fafc', fontWeight: '600', lineHeight: '1.8', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {studentData.skills || 'No skills identified yet.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', padding: '20px', color: '#cbd5e1', fontWeight: '600' }}>No resume uploaded yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div>
                        <div className="page-header">
                            <h1 className="page-title" style={{ color: '#ffffff' }}>Account Settings</h1>
                            <p className="page-subtitle" style={{ color: '#cbd5e1' }}>Manage your personal details and academic status</p>
                        </div>
                        <div className="card" style={{ maxWidth: '750px', margin: '0 auto' }}>
                            {studentData && (
                                <form onSubmit={handleSaveProfile}>
                                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#cbd5e1' }}>Full Name</label>
                                            <input type="text" placeholder="e.g. John Doe" className="input-field" value={editProfile.fullName} onChange={(e) => setEditProfile({...editProfile, fullName: e.target.value})} required />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#cbd5e1' }}>University Roll Number</label>
                                            <input type="text" placeholder="e.g. 23XX001" className="input-field" value={editProfile.universityRollNo} onChange={(e) => setEditProfile({...editProfile, universityRollNo: e.target.value})} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontWeight: '700', color: '#cbd5e1' }}>
                                            <span>Registered Email</span>
                                            {studentData.tcu_verified ? (
                                                <span style={{ fontSize: '12px', color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>✅ Verified</span>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: '#fbbf24', background: 'rgba(251, 191, 36, 0.15)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>⚠️ Pending Verification</span>
                                            )}
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input type="email" className="input-field" value={studentData.email || ''} disabled style={{ opacity: 0.7, cursor: 'not-allowed', paddingRight: '120px', width: '100%', boxSizing: 'border-box' }} title="Your login email cannot be changed here." />
                                            {!studentData.tcu_verified && (
                                                <button type="button" onClick={handleSendTcuOtpFromSettings} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#38bdf8', color: '#0f172a', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>Verify</button>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#cbd5e1' }}>Mobile Number</label>
                                            <input type="tel" placeholder="Enter 10-digit number" className="input-field" value={editProfile.mobileNumber} onChange={(e) => setEditProfile({...editProfile, mobileNumber: e.target.value})} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#cbd5e1' }}>Location (City, State)</label>
                                            <input type="text" placeholder="Enter your city and state" className="input-field" value={editProfile.location} onChange={(e) => setEditProfile({...editProfile, location: e.target.value})} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '25px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#cbd5e1' }}>Year of Study / Status</label>
                                        <select className="input-field" value={editProfile.yearOfStudy} onChange={(e) => setEditProfile({...editProfile, yearOfStudy: e.target.value})}>
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year (Final Year)</option>
                                            <option value="Passed Out / Graduate">🎓 Passed Out / Graduate (Alumni)</option>
                                        </select>
                                    </div>
                                    
                                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>💾 Save Profile</button>
                                    {profileMsg && <p style={{ marginTop: '15px', textAlign: 'center', color: profileMsg.includes('Failed') ? '#f87171' : '#34d399', fontWeight: '700' }}>{profileMsg}</p>}
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showTcuAuthModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1005 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px', border: '1px solid #38bdf8' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ color: '#38bdf8', fontWeight: '800' }}>Email Verification</h2>
                            <button onClick={() => setShowTcuAuthModal(false)} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                        </div>
                        <p style={{ color: '#cbd5e1', marginBottom: '25px', fontSize: '14px', lineHeight: '1.5', textAlign: 'center' }}>Enter the 6-digit code sent to your email to verify your account and unlock the AI Mentor.</p>
                        <form onSubmit={handleVerifyTcuOtp}>
                            <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                                <input type="text" maxLength="6" placeholder="• • • • • •" value={tcuOtp} onChange={(e) => setTcuOtp(e.target.value)} className="input-field" style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '800' }} required />
                            </div>
                            <button type="submit" className="btn-primary" style={{ width: '100%', background: '#34d399' }}>Verify OTP ✅</button>
                        </form>
                        {tcuAuthMsg && <p style={{ marginTop: '15px', textAlign: 'center', color: tcuAuthMsg.includes('Invalid') || tcuAuthMsg.includes('error') || tcuAuthMsg.includes('Failed') ? '#f87171' : '#38bdf8', fontWeight: '700' }}>{tcuAuthMsg}</p>}
                    </div>
                </div>
            )}

            {activeTab === 'career-guidance' && (
                <button onClick={() => setIsDsaModalOpen(true)} title="Get Free DSA Sheet" style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 1000, width: '65px', height: '65px', borderRadius: '50%', background: '#8b5cf6', color: '#ffffff', border: 'none', fontSize: '28px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>📘</button>
            )}

            {isDsaModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '45px', marginBottom: '15px' }}>📘</div>
                        <h2 style={{ color: '#ffffff', fontWeight: '800', marginBottom: '10px' }}>Exclusive DSA Sheet</h2>
                        <p style={{ color: '#cbd5e1', marginBottom: '25px', lineHeight: '1.6' }}>Would you like to receive our curated Top 150 DSA Questions sheet? We will email the link directly to you.</p>
                        {dsaEmailStatus && <p style={{ marginBottom: '20px', color: dsaEmailStatus.includes('Success') ? '#34d399' : '#f87171', fontWeight: '700' }}>{dsaEmailStatus}</p>}
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            <button onClick={() => setIsDsaModalOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                            <button onClick={handleRequestDsaSheet} className="btn-primary" disabled={dsaEmailStatus === 'Sending...'}>{dsaEmailStatus === 'Sending...' ? 'Sending...' : 'Yes, Email It! 🚀'}</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, display: 'flex', alignItems: 'flex-end', gap: '15px' }}>
                {isChatOpen && (
                    <div className="card" style={{ position: 'absolute', bottom: '80px', right: '0', width: '350px', height: '480px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ background: '#38bdf8', padding: '15px', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ fontSize: '20px' }}>🤖</span><span>TCU Mentor</span></div>
                            <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>✖</button>
                        </div>
                        <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(15, 23, 42, 0.95)' }}>
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', background: msg.role === 'user' ? '#38bdf8' : 'rgba(255,255,255,0.1)', color: msg.role === 'user' ? '#0f172a' : '#f8fafc', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', maxWidth: '85%', fontSize: '0.9em', lineHeight: '1.5', fontWeight: '500', wordBreak: 'break-word' }} dangerouslySetInnerHTML={formatMessage(msg.text)} />
                            ))}
                            {isChatLoading && <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.85em', fontStyle: 'italic' }}>TCU is typing...</div>}
                        </div>
                        <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px', background: '#1e293b' }}>
                            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask TCU a question..." className="input-field" style={{ flex: 1, marginBottom: 0, padding: '10px', fontSize: '0.9em' }} />
                            <button type="submit" className="btn-primary" style={{ padding: '10px 16px', borderRadius: '8px' }} disabled={isChatLoading}>➤</button>
                        </form>
                    </div>
                )}
                
                {isChatOpen && (
                    <button onClick={handleEmailChat} title="Email this conversation to me" style={{ width: '50px', height: '50px', borderRadius: '50%', background: emailStatus === 'success' ? '#34d399' : emailStatus === 'error' ? '#f87171' : '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', fontSize: '22px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        {emailStatus === 'sending' ? '⏳' : emailStatus === 'success' ? '✅' : emailStatus === 'error' ? '❌' : '📧'}
                    </button>
                )}

                <button onClick={() => studentData?.tcu_verified ? setIsChatOpen(!isChatOpen) : alert("Please Verify your Email in Account Settings first to unlock the AI Mentor!")} style={{ width: '65px', height: '65px', borderRadius: '50%', background: '#38bdf8', color: '#0f172a', border: 'none', fontSize: '28px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    {isChatOpen ? '✖' : '💬'}
                </button>
            </div>
        </div>
    );
}