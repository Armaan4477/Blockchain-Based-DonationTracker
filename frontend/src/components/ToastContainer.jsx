import React from "react";
import { useWeb3 } from "../context/Web3Context";

export default function ToastContainer() {
    const { toasts, removeToast } = useWeb3();

    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div 
                    key={t.id} 
                    className={`toast toast-${t.type}`}
                    onClick={() => removeToast(t.id)}
                    style={{ cursor: "pointer" }}
                >
                    <div style={{ flex: 1 }}>
                        <div className="toast-title">{t.title}</div>
                        <div className="toast-msg">{t.message}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
