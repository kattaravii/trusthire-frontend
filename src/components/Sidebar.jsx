import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Make sure CSS is imported

export default function Sidebar({ role, activeTab, setActiveTab }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const studentMenu = [
        { id: 'dashboard', label: '📊 Dashboard' },
        { id: 'career-guidance', label: '🚀 Career Guidance' },
        { id: 'resumes', label: '📄 My Resumes' },
        { id: 'settings', label: '⚙️ Settings' }
    ];

    const companyMenu = [
        { id: 'candidate-pool', label: '👥 Candidate Pool' },
        { id: 'saved-profiles', label: '⭐ Saved Profiles' },
        { id: 'post-a-job', label: '➕ Post a Job' },
        { id: 'settings', label: '⚙️ Settings' }
    ];

    const menuItems = role === 'company' ? companyMenu : studentMenu;

    return (
        <div className="sidebar-container">
            <h2 className="sidebar-title">TrustHire AI</h2>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`sidebar-btn ${activeTab === item.id ? 'active' : ''}`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
            <button onClick={handleLogout} className="sidebar-logout">
                🚪 Logout
            </button>
        </div>
    );
}