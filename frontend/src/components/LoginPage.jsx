import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login, signUp } = useAuth();
    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        await new Promise(r => setTimeout(r, 400)); // slight delay for UX

        try {
            if (mode === "login") {
                const result = login(username, password);
                if (!result.success) {
                    setError(result.error);
                }
            } else {
                if (password !== confirmPassword) {
                    setError("Passwords do not match.");
                    setLoading(false);
                    return;
                }
                const result = signUp(username, password, displayName);
                if (!result.success) {
                    setError(result.error);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setDisplayName("");
    };

    return (
        <div className="auth-page">
            {/* Animated background blobs */}
            <div className="auth-bg">
                <div className="auth-blob auth-blob-1" />
                <div className="auth-blob auth-blob-2" />
                <div className="auth-blob auth-blob-3" />
            </div>

            <div className="auth-card">
                {/* Logo / Brand */}
                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="m9 12 2 2 4-4"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="auth-brand-name">DonationTracker</h1>
                        <p className="auth-brand-sub">Blockchain-Powered Transparent Giving</p>
                    </div>
                </div>

                {/* Tab switcher */}
                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${mode === "login" ? "active" : ""}`}
                        onClick={() => switchMode("login")}
                        type="button"
                        id="tab-login"
                    >
                        Sign In
                    </button>
                    <button
                        className={`auth-tab ${mode === "signup" ? "active" : ""}`}
                        onClick={() => switchMode("signup")}
                        type="button"
                        id="tab-signup"
                    >
                        Create Account
                    </button>
                </div>

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
                    {mode === "signup" && (
                        <div className="auth-field">
                            <label htmlFor="auth-displayname">Full Name</label>
                            <div className="auth-input-wrapper">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                <input
                                    id="auth-displayname"
                                    type="text"
                                    className="auth-input"
                                    placeholder="Your name (e.g. Ramesh Sharma)"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="auth-username">Username</label>
                        <div className="auth-input-wrapper">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <input
                                id="auth-username"
                                type="text"
                                className="auth-input"
                                placeholder="Enter username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                autoComplete="off"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label htmlFor="auth-password">Password</label>
                        <div className="auth-input-wrapper">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <input
                                id="auth-password"
                                type={showPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder={mode === "signup" ? "Min. 6 characters" : "Enter password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="auth-eye-btn"
                                onClick={() => setShowPassword(p => !p)}
                                tabIndex={-1}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {mode === "signup" && (
                        <div className="auth-field">
                            <label htmlFor="auth-confirm">Confirm Password</label>
                            <div className="auth-input-wrapper">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <input
                                    id="auth-confirm"
                                    type={showPassword ? "text" : "password"}
                                    className="auth-input"
                                    placeholder="Repeat password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="auth-error" role="alert">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={loading}
                        id="auth-submit-btn"
                    >
                        {loading ? (
                            <span className="auth-spinner" />
                        ) : (
                            <>
                                {mode === "login" ? (
                                    <>
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                            <polyline points="10 17 15 12 10 7"/>
                                            <line x1="15" y1="12" x2="3" y2="12"/>
                                        </svg>
                                        <span>Sign In</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                            <circle cx="8.5" cy="7" r="4"/>
                                            <line x1="20" y1="8" x2="20" y2="14"/>
                                            <line x1="23" y1="11" x2="17" y2="11"/>
                                        </svg>
                                        <span>Create Account (Donor)</span>
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </form>

                {/* Info hint */}
                {mode === "login" && (
                    <div className="auth-hint">
                        <div className="auth-hint-item">
                            <span className="auth-role-badge role-admin">Admin</span>
                            <span>Login: <code>admin</code> / <code>admin123</code></span>
                        </div>
                        <div className="auth-hint-item">
                            <span className="auth-role-badge role-donor">Donor</span>
                            <span>Sign up to create a donor account</span>
                        </div>
                        <div className="auth-hint-item">
                            <span className="auth-role-badge role-ngo">NGO Owner</span>
                            <span>Assigned by Admin only</span>
                        </div>
                    </div>
                )}

                {mode === "signup" && (
                    <div className="auth-note">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span>New accounts start as <strong>Donor</strong>. NGO Owner rights must be granted by the admin.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
