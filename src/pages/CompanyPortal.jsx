import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

export default function CompanyPortal() {
    const [activeTab, setActiveTab] = useState('candidate-pool');
    const [applications, setApplications] = useState([]);
    const [savedProfiles, setSavedProfiles] = useState([]);
    const [postedJobs, setPostedJobs] = useState([]); 
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All Trust Statuses');

    const [jobData, setJobData] = useState({ 
        title: '', 
        experience: 'Fresher', 
        location: '', 
        expectedZone: 'On-site',
        salary: '',
        skills: '' 
    });
    const [jobMsg, setJobMsg] = useState('');

    const [companyProfile, setCompanyProfile] = useState({ companyName: 'TrustHire Partner Inc.', hrName: 'Jane Doe', contactEmail: 'hr@trusthire.com', website: 'www.trusthirepartner.com', industry: 'Information Technology' });
    const [settingsMsg, setSettingsMsg] = useState('');

    const [isMailModalOpen, setIsMailModalOpen] = useState(false);
    const [mailData, setMailData] = useState({ name: '', email: '', subject: '', body: '' });
    const [mailSendStatus, setMailSendStatus] = useState('');

    // --- STATES FOR RID ACTIVATION ---
    const [inputRid, setInputRid] = useState('');
    const [ridMessage, setRidMessage] = useState('');
    const [adminTestMsg, setAdminTestMsg] = useState('');

    useEffect(() => {
        const role = localStorage.getItem('role');
        const token = localStorage.getItem('token');
        if (!role || role.trim().toLowerCase() !== 'company' || !token) {
            navigate('/login');
            return;
        }
        fetchApplications();
        fetchPostedJobs(); 
    }, [navigate]);

    const fetchApplications = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/company/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            }
        } catch (err) { console.error(err); }
    };

    const fetchPostedJobs = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/company/jobs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPostedJobs(data);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteApplication = async (appId) => {
        if (!window.confirm("Are you sure you want to delete this received application/resume?")) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/company/applications/${appId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setApplications(applications.filter(app => app.application_id !== appId));
                setSavedProfiles(savedProfiles.filter(id => id !== appId));
            } else {
                alert('Failed to delete application.');
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm("Are you sure you want to stop hiring? This will remove the job from the student portal permanently.")) return;
        
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/company/jobs/${jobId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                setPostedJobs(postedJobs.filter(job => job.job_id !== jobId));
                setJobMsg('Job removed successfully. It is no longer visible to students.');
            } else {
                alert('Failed to delete job.');
            }
        } catch (err) { 
            console.error(err); 
            alert('Server error while deleting job.');
        }
        
        setTimeout(() => setJobMsg(''), 4000);
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        setJobMsg('Publishing job and notifying students...');
        
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://127.0.0.1:5000/api/company/jobs', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(jobData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setJobMsg('Success! Job posted to the student network and emails sent.');
                setJobData({ title: '', experience: 'Fresher', location: '', expectedZone: 'On-site', salary: '', skills: '' });
                fetchPostedJobs(); 
            } else {
                setJobMsg(`Error: ${data.error}`);
            }
        } catch (err) {
            setJobMsg('Failed to connect to the server.');
        }
        
        setTimeout(() => setJobMsg(''), 5000);
    };

    const handleSaveSettings = (e) => {
        e.preventDefault();
        setSettingsMsg('Profile updated securely.');
        setTimeout(() => setSettingsMsg(''), 3000);
    };

    const toggleSaveProfile = (appId) => {
        if (savedProfiles.includes(appId)) {
            setSavedProfiles(savedProfiles.filter(id => id !== appId));
        } else {
            setSavedProfiles([...savedProfiles, appId]);
        }
    };

    const openMailDraft = (app) => {
        setMailData({
            name: app.full_name,
            email: app.email,
            subject: `Update on your TrustHire Application - ${app.applied_role}`,
            body: `Dear ${app.full_name},\n\nCongratulations! Your resume has been shortlisted for the ${app.applied_role} position.\n\nPlease wait for our official company email regarding the upcoming selection process and technical round links. Stay in touch and keep an eye on your inbox for further updates.\n\nBest regards,\n[Your Company Name]`
        });
        setMailSendStatus('');
        setIsMailModalOpen(true);
    };

    const closeMailDraft = () => setIsMailModalOpen(false);

    const handleSendMail = async (e) => {
        e.preventDefault();
        setMailSendStatus('Sending...');
        
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/company/send-mail', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    email: mailData.email,
                    subject: mailData.subject,
                    body: mailData.body,
                    companyName: companyProfile.companyName 
                })
            });

            if (response.ok) {
                setMailSendStatus('Email sent successfully! ✅');
                setTimeout(() => { closeMailDraft(); }, 1500);
            } else {
                setMailSendStatus('Failed to send email. ❌');
            }
        } catch (error) {
            console.error('Email error:', error);
            setMailSendStatus('Error connecting to server. ❌');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = (app.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (app.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || app.applied_role === roleFilter;
        const matchesStatus = statusFilter === 'All Trust Statuses' || app.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const savedApplicationsList = applications.filter(app => savedProfiles.includes(app.application_id));

    return (
        <div className="app-layout">
            
            <div className="sidebar-container">
                <h2 className="sidebar-title">TrustHire AI</h2>
                
                <div className="nav-links-wrapper">
                    <button 
                        className={`sidebar-btn ${activeTab === 'candidate-pool' ? 'active' : ''}`}
                        onClick={() => setActiveTab('candidate-pool')}
                    >
                        👥 Candidate Pool
                    </button>
                    <button 
                        className={`sidebar-btn ${activeTab === 'saved-profiles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('saved-profiles')}
                    >
                        ⭐ Saved Profiles
                    </button>
                    <button 
                        className={`sidebar-btn ${activeTab === 'post-a-job' ? 'active' : ''}`}
                        onClick={() => setActiveTab('post-a-job')}
                    >
                        ➕ Post a Job
                    </button>
                    <button 
                        className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        ⚙️ Settings
                    </button>
                    <button className="sidebar-logout" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </div>
            
            <div className="page-container">
                
                {activeTab === 'candidate-pool' && (
                    <div>
                        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h1 className="page-title" style={{ color: '#ffffff' }}>Recruitment Dashboard</h1>
                                <p className="page-subtitle" style={{ color: '#f8fafc' }}>Review, filter, and manage incoming applications</p>
                            </div>
                            <button onClick={() => setActiveTab('post-a-job')} className="btn-primary">+ Post New Job</button>
                        </div>

                        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" style={{ width: '300px' }} />
                            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field" style={{ width: '200px' }}>
                                <option>All Roles</option>
                                <option>Full Stack Developer</option>
                                <option>Frontend Developer</option>
                                <option>Data Analyst</option>
                            </select>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field" style={{ width: '200px' }}>
                                <option>All Trust Statuses</option>
                                <option>Low Risk</option>
                                <option>Needs Review</option>
                            </select>
                        </div>

                        <div className="card">
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ fontSize: '13px', textTransform: 'uppercase', color: '#f8fafc', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Candidate Name</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Applied Role</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Resume Skills</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>ATS Score</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Trust Score</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Status</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.length > 0 ? (
                                        filteredApplications.map((app) => (
                                            <tr key={app.application_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <td style={{ padding: '16px 10px' }}>
                                                    <strong style={{ color: '#ffffff', fontSize: '15px' }}>{app.full_name}</strong>
                                                    <div style={{ fontSize: '0.85em', color: '#e2e8f0', marginTop: '4px', fontWeight: '600' }}>{app.email}</div>
                                                </td>
                                                <td style={{ padding: '16px 10px' }}>
                                                    <span style={{ color: '#ffffff', fontWeight: '700' }}>{app.applied_role}</span>
                                                </td>
                                                <td style={{ padding: '16px 10px', fontSize: '0.9em', maxWidth: '200px', lineHeight: '1.5' }}>
                                                    <span style={{ color: '#f8fafc', fontWeight: '600' }}>{app.skills || 'N/A'}</span>
                                                </td>
                                                <td style={{ padding: '16px 10px', fontSize: '16px' }}>
                                                    <span style={{ color: '#ffffff', fontWeight: '800' }}>{app.ats_score || 0}%</span>
                                                </td>
                                                <td style={{ padding: '16px 10px', fontSize: '16px' }}>
                                                    <span style={{ color: '#ffffff', fontWeight: '800' }}>{app.trust_score || 0}%</span>
                                                </td>
                                                <td style={{ padding: '16px 10px' }}>
                                                    <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: '700', backgroundColor: app.status === 'Low Risk' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: app.status === 'Low Risk' ? '#34d399' : '#fbbf24' }}>
                                                        {app.status || 'Needs Review'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {app.resume_url && (
                                                        <a href={app.resume_url} target="_blank" rel="noopener noreferrer" style={{ padding: '8px', fontSize: '0.85em', textDecoration: 'none', color: '#38bdf8', fontWeight: '700' }}>👁️ View</a>
                                                    )}
                                                    <button onClick={() => openMailDraft(app)} style={{ background: 'none', border: 'none', padding: '8px', fontSize: '0.85em', color: '#c084fc', fontWeight: '700', cursor: 'pointer' }}>✉️ Mail</button>
                                                    <button onClick={() => toggleSaveProfile(app.application_id)} style={{ background: 'none', border: 'none', padding: '8px', fontSize: '0.85em', color: savedProfiles.includes(app.application_id) ? '#fbbf24' : '#f8fafc', fontWeight: '700', cursor: 'pointer' }}>
                                                        ⭐ {savedProfiles.includes(app.application_id) ? 'Saved' : 'Save'}
                                                    </button>
                                                    <button onClick={() => handleDeleteApplication(app.application_id)} style={{ background: 'none', border: 'none', padding: '8px', fontSize: '0.85em', color: '#f43f5e', fontWeight: '700', cursor: 'pointer' }}>
                                                        🗑️ Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#f8fafc', fontWeight: '600' }}>No applications received yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'saved-profiles' && (
                    <div>
                        <div className="page-header">
                            <h1 className="page-title" style={{ color: '#ffffff' }}>Saved Profiles</h1>
                            <p className="page-subtitle" style={{ color: '#f8fafc' }}>Your shortlisted candidates for quick access</p>
                        </div>

                        <div className="card">
                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ fontSize: '13px', textTransform: 'uppercase', color: '#f8fafc', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Candidate Name</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Applied Role</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Resume Skills</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>ATS Score</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Trust Score</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Status</th>
                                        <th style={{ padding: '16px 10px', fontWeight: '800' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {savedApplicationsList.length > 0 ? (
                                        savedApplicationsList.map((app) => (
                                            <tr key={app.application_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <td style={{ padding: '16px 10px' }}>
                                                    <strong style={{ color: '#ffffff', fontSize: '15px' }}>{app.full_name}</strong>
                                                    <div style={{ fontSize: '0.85em', color: '#e2e8f0', marginTop: '4px', fontWeight: '600' }}>{app.email}</div>
                                                </td>
                                                <td style={{ padding: '16px 10px' }}>
                                                    <span style={{ color: '#ffffff', fontWeight: '700' }}>{app.applied_role}</span>
                                                </td>
                                                <td style={{ padding: '16px 10px', fontSize: '0.9em', maxWidth: '200px', lineHeight: '1.5' }}>
                                                    <span style={{ color: '#f8fafc', fontWeight: '600' }}>{app.skills || 'N/A'}</span>
                                                </td>
                                                <td style={{ padding: '16px 10px', fontSize: '16px' }}>
                                                    <span style={{ color: '#ffffff', fontWeight: '800' }}>{app.ats_score || 0}%</span>
                                                </td>
                                                <td style={{ padding: '16px 10px', fontSize: '16px' }}>
                                                    <span style={{ color: '#ffffff', fontWeight: '800' }}>{app.trust_score || 0}%</span>
                                                </td>
                                                <td style={{ padding: '16px 10px' }}>
                                                    <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.85em', fontWeight: '700', backgroundColor: app.status === 'Low Risk' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: app.status === 'Low Risk' ? '#34d399' : '#fbbf24' }}>
                                                        {app.status || 'Needs Review'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 10px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    {app.resume_url && (
                                                        <a href={app.resume_url} target="_blank" rel="noopener noreferrer" style={{ padding: '8px', fontSize: '0.85em', textDecoration: 'none', color: '#38bdf8', fontWeight: '700' }}>👁️ View</a>
                                                    )}
                                                    <button onClick={() => openMailDraft(app)} style={{ background: 'none', border: 'none', padding: '8px', fontSize: '0.85em', color: '#c084fc', fontWeight: '700', cursor: 'pointer' }}>✉️ Mail</button>
                                                    <button onClick={() => toggleSaveProfile(app.application_id)} style={{ background: 'none', border: 'none', padding: '8px', fontSize: '0.85em', color: savedProfiles.includes(app.application_id) ? '#fbbf24' : '#f8fafc', fontWeight: '700', cursor: 'pointer' }}>
                                                        ⭐ {savedProfiles.includes(app.application_id) ? 'Saved' : 'Save'}
                                                    </button>
                                                    <button onClick={() => handleDeleteApplication(app.application_id)} style={{ background: 'none', border: 'none', padding: '8px', fontSize: '0.85em', color: '#f43f5e', fontWeight: '700', cursor: 'pointer' }}>
                                                        🗑️ Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#f8fafc', fontWeight: '600' }}>No saved profiles yet. Click 'Save' on a candidate to shortlist them.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'post-a-job' && (
                    <div>
                        <div className="page-header"><h1 className="page-title" style={{ color: '#ffffff' }}>Post & Manage Job Roles</h1></div>
                        
                        <div className="card" style={{ maxWidth: '800px', margin: '0 auto 40px auto' }}>
                            <form onSubmit={handlePostJob}>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#f8fafc' }}>Job Title</label>
                                        <input type="text" placeholder="e.g. Full Stack Developer" value={jobData.title} onChange={(e) => setJobData({...jobData, title: e.target.value})} className="input-field" required />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#f8fafc' }}>Experience Required</label>
                                        <select value={jobData.experience} onChange={(e) => setJobData({...jobData, experience: e.target.value})} className="input-field">
                                            <option>Fresher</option><option>0 - 1 Years</option><option>1 - 3 Years</option><option>3+ Years</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#f8fafc' }}>Location</label>
                                        <input type="text" placeholder="e.g. Bangalore, Hyderabad" value={jobData.location} onChange={(e) => setJobData({...jobData, location: e.target.value})} className="input-field" required />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#f8fafc' }}>Work Zone / Mode</label>
                                        <select value={jobData.expectedZone} onChange={(e) => setJobData({...jobData, expectedZone: e.target.value})} className="input-field">
                                            <option>On-site</option>
                                            <option>Hybrid</option>
                                            <option>Remote</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#f8fafc' }}>Expected Salary Range</label>
                                        <input type="text" placeholder="e.g. 8 - 12 LPA" value={jobData.salary} onChange={(e) => setJobData({...jobData, salary: e.target.value})} className="input-field" required />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#f8fafc' }}>Key Skills Required (Comma separated)</label>
                                    <input type="text" placeholder="e.g. React, Node.js, MongoDB" value={jobData.skills} onChange={(e) => setJobData({...jobData, skills: e.target.value})} className="input-field" required />
                                </div>

                                <button type="submit" className="btn-primary">📢 Publish Job Posting</button>
                                {jobMsg && <p style={{ marginTop: '15px', color: '#34d399', fontWeight: '700' }}>{jobMsg}</p>}
                            </form>
                        </div>

                        {/* --- ACTIVE JOB POSTINGS MANAGEMENT --- */}
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <h3 style={{ color: '#ffffff', fontWeight: '800', marginBottom: '20px' }}>Your Active Job Postings</h3>
                            
                            {postedJobs.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontStyle: 'italic', background: '#111827', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>You have no active job postings.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {postedJobs.map((job) => (
                                        <li key={job.job_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#111827', marginBottom: '15px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                                            <div>
                                                <div style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8', marginBottom: '8px' }}>💼 {job.title}</div>
                                                <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                                    <span>📍 {job.location || 'Not Disclosed'}</span>
                                                    <span>💰 {job.salary || 'Not Disclosed'}</span>
                                                    <span>🏢 {job.expected_zone || job.expectedZone || 'On-site'}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteJob(job.job_id)} 
                                                style={{ 
                                                    background: 'rgba(239, 68, 68, 0.1)', 
                                                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                                                    color: '#fca5a5', 
                                                    padding: '10px 16px', 
                                                    borderRadius: '8px', 
                                                    cursor: 'pointer', 
                                                    fontWeight: '700', 
                                                    transition: 'all 0.2s',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                            >
                                                🛑 Stop Hiring / Delete
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div>
                        <div className="page-header"><h1 className="page-title" style={{ color: '#ffffff' }}>Company Profile Settings</h1></div>
                        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            
                            {/* --- RID VERIFICATION UI --- */}
                            <div style={{ marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <h3 style={{ color: '#ffffff', fontWeight: '800', marginBottom: '15px' }}>
                                    🔐 TrustHire Verification (RID)
                                </h3>
                                <p style={{ color: '#cbd5e1', marginBottom: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                                    To maintain a secure platform, only verified companies can post jobs. Enter the Registration ID (RID) emailed to you by the TrustHire Admin team to unlock your account.
                                </p>
                                
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    setRidMessage('Verifying...');
                                    try {
                                        const res = await fetch('http://127.0.0.1:5000/api/company/verify-rid', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                            body: JSON.stringify({ rid: inputRid })
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                            setRidMessage('✅ ' + data.message);
                                            setInputRid('');
                                        } else {
                                            setRidMessage('❌ ' + data.error);
                                        }
                                    } catch (err) {
                                        setRidMessage('❌ Network error verifying RID.');
                                    }
                                }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. TH-A1B2C3" 
                                            className="input-field" 
                                            value={inputRid} 
                                            onChange={(e) => setInputRid(e.target.value.toUpperCase())}
                                            style={{ flex: 1, marginBottom: 0, fontWeight: '700', letterSpacing: '2px' }}
                                            required
                                        />
                                        <button type="submit" className="btn-primary" style={{ background: '#38bdf8', color: '#0f172a', whiteSpace: 'nowrap' }}>
                                            Activate RID
                                        </button>
                                    </div>
                                    {ridMessage && <p style={{ color: ridMessage.includes('✅') ? '#34d399' : '#f87171', fontWeight: '700', marginTop: '10px' }}>{ridMessage}</p>}
                                </form>

                                {/* Developer Test Tool to Simulate Admin Approval */}
                                <div style={{ marginTop: '25px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                    <p style={{ color: '#f8fafc', fontSize: '12px', marginBottom: '10px' }}>
                                        <strong>Developer Test Tool:</strong> Click this to generate an RID and send it to the <b>TrustHire Admin Team</b>.
                                    </p>
                                    <button 
                                        onClick={async () => {
                                            setAdminTestMsg('Sending to Admin Team...');
                                            const res = await fetch('http://127.0.0.1:5000/api/company/test-trigger-admin-rid', {
                                                method: 'POST',
                                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                            });
                                            const data = await res.json();
                                            if (res.ok) setAdminTestMsg('✅ Sent to TrustHire Team Inbox!');
                                            else setAdminTestMsg('❌ ' + data.error);
                                        }}
                                        type="button"
                                        style={{ background: 'transparent', border: '1px solid #cbd5e1', color: '#cbd5e1', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        Generate & Send RID to Admin
                                    </button>
                                    {adminTestMsg && <span style={{ marginLeft: '10px', fontSize: '12px', color: '#34d399' }}>{adminTestMsg}</span>}
                                </div>
                            </div>

                            <form onSubmit={handleSaveSettings}>
                                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#f8fafc' }}>Organization Name</label>
                                        <input type="text" value={companyProfile.companyName} onChange={(e) => setCompanyProfile({...companyProfile, companyName: e.target.value})} className="input-field" required />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#f8fafc' }}>Industry</label>
                                        <input type="text" value={companyProfile.industry} onChange={(e) => setCompanyProfile({...companyProfile, industry: e.target.value})} className="input-field" />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary">💾 Save Profile Details</button>
                                {settingsMsg && <p style={{ marginTop: '15px', color: '#34d399', fontWeight: '700' }}>{settingsMsg}</p>}
                            </form>
                        </div>
                    </div>
                )}
            </div>

            {/* REAL MAIL MODAL */}
            {isMailModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ color: '#ffffff', fontWeight: '800' }}>Draft Email to {mailData.name}</h2>
                            <button onClick={closeMailDraft} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#f8fafc' }}>✖</button>
                        </div>
                        <form onSubmit={handleSendMail}>
                            <input type="text" value={mailData.subject} onChange={(e) => setMailData({...mailData, subject: e.target.value})} className="input-field" style={{ marginBottom: '15px' }} required />
                            <textarea value={mailData.body} onChange={(e) => setMailData({...mailData, body: e.target.value})} className="input-field" style={{ height: '180px', marginBottom: '20px' }} required />
                            <button type="submit" className="btn-primary" disabled={mailSendStatus === 'Sending...'}>
                                {mailSendStatus === 'Sending...' ? 'Sending...' : '📤 Send Email'}
                            </button>
                            {mailSendStatus && <p style={{ marginTop: '15px', color: '#34d399', fontWeight: '700' }}>{mailSendStatus}</p>}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}