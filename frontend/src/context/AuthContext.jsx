import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const AuthContext = createContext();

// ─── Hardcoded Admin Credentials ────────────────────────────────────────────
const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "admin123",
    role: "admin",
    displayName: "Platform Administrator",
};

// ─── Persistence Helpers ─────────────────────────────────────────────────────
const STORAGE_KEYS = {
    USERS: "dt_users",
    SESSION: "dt_session",
};

function loadUsers() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.USERS);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function loadSession() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveSession(session) {
    if (session) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => loadSession());
    const [users, setUsers] = useState(() => loadUsers());

    useEffect(() => {
        saveUsers(users);
    }, [users]);

    useEffect(() => {
        saveSession(currentUser);
    }, [currentUser]);

    const login = useCallback((username, password) => {
        const trimUser = username.trim().toLowerCase();
        const trimPass = password.trim();

        if (
            trimUser === ADMIN_CREDENTIALS.username.toLowerCase() &&
            trimPass === ADMIN_CREDENTIALS.password
        ) {
            const session = {
                username: ADMIN_CREDENTIALS.username,
                displayName: ADMIN_CREDENTIALS.displayName,
                role: "admin",
            };
            setCurrentUser(session);
            return { success: true, role: "admin" };
        }

        const found = users.find(
            (u) =>
                u.username.toLowerCase() === trimUser && u.password === trimPass
        );

        if (!found) {
            return { success: false, error: "Invalid username or password." };
        }

        const session = {
            username: found.username,
            displayName: found.displayName,
            role: found.role,
        };
        setCurrentUser(session);
        return { success: true, role: found.role };
    }, [users]);

    const signUp = useCallback((username, password, displayName) => {
        const trimUser = username.trim().toLowerCase();

        if (trimUser === ADMIN_CREDENTIALS.username.toLowerCase()) {
            return { success: false, error: "This username is reserved." };
        }

        if (users.find((u) => u.username.toLowerCase() === trimUser)) {
            return { success: false, error: "Username already taken. Please choose another." };
        }

        if (username.trim().length < 3) {
            return { success: false, error: "Username must be at least 3 characters." };
        }

        if (password.trim().length < 6) {
            return { success: false, error: "Password must be at least 6 characters." };
        }

        const newUser = {
            username: username.trim(),
            password: password.trim(),
            displayName: displayName.trim() || username.trim(),
            role: "donor",
            createdAt: Date.now(),
        };

        setUsers((prev) => [...prev, newUser]);

        const session = {
            username: newUser.username,
            displayName: newUser.displayName,
            role: "donor",
        };
        setCurrentUser(session);
        return { success: true, role: "donor" };
    }, [users]);

    const logout = useCallback(() => {
        setCurrentUser(null);
    }, []);

    const assignNGORole = useCallback((targetUsername) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.username.toLowerCase() === targetUsername.toLowerCase()
                    ? { ...u, role: "ngo_owner" }
                    : u
            )
        );
    }, []);

    const revokeNGORole = useCallback((targetUsername) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.username.toLowerCase() === targetUsername.toLowerCase()
                    ? { ...u, role: "donor" }
                    : u
            )
        );
    }, []);

    const isAdmin = currentUser?.role === "admin";
    const isNGOOwner = currentUser?.role === "ngo_owner";
    const isDonor = currentUser?.role === "donor";
    const isLoggedIn = !!currentUser;

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                users,
                isAdmin,
                isNGOOwner,
                isDonor,
                isLoggedIn,
                login,
                signUp,
                logout,
                assignNGORole,
                revokeNGORole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
