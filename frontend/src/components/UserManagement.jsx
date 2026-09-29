import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ROLE_LABELS = {
    admin: { label: "Admin", cls: "role-admin" },
    ngo_owner: { label: "NGO Owner", cls: "role-ngo" },
    donor: { label: "Donor", cls: "role-donor" },
};

export default function UserManagement() {
    const { users, assignNGORole, revokeNGORole } = useAuth();
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const filtered = users.filter(
        u =>
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            (u.displayName || "").toLowerCase().includes(search.toLowerCase())
    );

    const handleAssign = async (username) => {
        setActionLoading(username + "_assign");
        await new Promise(r => setTimeout(r, 400));
        assignNGORole(username);
        setActionLoading(null);
    };

    const handleRevoke = async (username) => {
        setActionLoading(username + "_revoke");
        await new Promise(r => setTimeout(r, 400));
        revokeNGORole(username);
        setActionLoading(null);
    };

    return (
        <div className="panel glass-card">
            <div className="panel-header">
                <div className="panel-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <h3>User Management</h3>
                </div>
                <span className="badge badge-amber">Admin Only</span>
            </div>

            <div className="panel-body">
                <div className="info-box info-box-admin">
                    <p>
                        <strong>Role Control:</strong> All new sign-ups default to <strong>Donor</strong> role.
                        Only you (Admin) can promote a user to <strong>NGO Owner</strong>, granting them
                        access to withdrawal and administrative console functions.
                    </p>
                </div>

                <div className="user-mgmt-search">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Search users by name or username..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        id="user-search-input"
                        style={{ paddingLeft: "8px" }}
                    />
                </div>

                {users.length === 0 ? (
                    <div className="user-empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14"/>
                            <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        <p>No registered users yet.</p>
                        <span>Users will appear here once they sign up.</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="user-empty-state">
                        <p>No users match your search.</p>
                    </div>
                ) : (
                    <div className="user-list">
                        {filtered.map(user => {
                            const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.donor;
                            const isNGO = user.role === "ngo_owner";
                            return (
                                <div key={user.username} className="user-list-item">
                                    <div className="user-list-avatar">
                                        {(user.displayName || user.username)[0].toUpperCase()}
                                    </div>
                                    <div className="user-list-info">
                                        <div className="user-list-name">
                                            {user.displayName || user.username}
                                            <span className={`auth-role-badge ${roleInfo.cls}`} style={{ marginLeft: "8px" }}>
                                                {roleInfo.label}
                                            </span>
                                        </div>
                                        <div className="user-list-username">@{user.username}</div>
                                    </div>
                                    <div className="user-list-actions">
                                        {isNGO ? (
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                style={{ fontSize: "0.76rem", borderColor: "var(--danger-fg)", color: "var(--danger-fg)" }}
                                                disabled={actionLoading === user.username + "_revoke"}
                                                onClick={() => handleRevoke(user.username)}
                                                id={`revoke-ngo-${user.username}`}
                                            >
                                                {actionLoading === user.username + "_revoke" ? "..." : "Revoke NGO"}
                                            </button>
                                        ) : (
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                style={{ fontSize: "0.76rem", borderColor: "var(--success-fg)", color: "var(--success-fg)" }}
                                                disabled={actionLoading === user.username + "_assign"}
                                                onClick={() => handleAssign(user.username)}
                                                id={`assign-ngo-${user.username}`}
                                            >
                                                {actionLoading === user.username + "_assign" ? "..." : "Make NGO Owner"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="user-stats-row">
                    <div className="user-stat-pill">
                        <span className="auth-role-badge role-donor">Donors</span>
                        <strong>{users.filter(u => u.role === "donor").length}</strong>
                    </div>
                    <div className="user-stat-pill">
                        <span className="auth-role-badge role-ngo">NGO Owners</span>
                        <strong>{users.filter(u => u.role === "ngo_owner").length}</strong>
                    </div>
                    <div className="user-stat-pill">
                        <span>Total Registered</span>
                        <strong>{users.length}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}
