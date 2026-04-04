import React from 'react';
import { ThemeColors } from '../types';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    colors: ThemeColors;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, colors }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease'
        }} onClick={onClose}>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
            <div style={{
                width: '500px', backgroundColor: colors.surface, borderRadius: '20px',
                padding: '40px', position: 'relative', border: `1px solid ${colors.border}`,
                boxShadow: `0 20px 50px ${colors.shadow}`,
                animation: 'slideUp 0.4s cubic-bezier(0.2, 1, 0.3, 1)',
                overflow: 'hidden'
            }} onClick={(e) => e.stopPropagation()}>
                {/* Glow behind the modal content */}
                <div style={{
                    position: 'absolute', top: '-100px', right: '-100px',
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: `radial-gradient(circle, ${colors.accent}22 0%, transparent 70%)`
                }}></div>

                <h2 style={{
                    marginTop: 0, fontSize: '2rem', fontWeight: 800,
                    color: colors.text, marginBottom: '20px'
                }}>About <span style={{ color: colors.accent }}>Compiler</span></h2>

                <p style={{
                    color: colors.textMuted, lineHeight: 1.7, fontSize: '1rem',
                    marginBottom: '30px'
                }}>
                    A premium, high-performance web-based code editor and compiler.
                    Experience near-instant execution for <strong>Python</strong> via Pyodide
                    and cloud-powered <strong>Java</strong> execution through Judge0.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '35px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent }}></div>
                        <span style={{ color: colors.text, fontWeight: 600 }}>In-browser Python (Pyodide)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent }}></div>
                        <span style={{ color: colors.text, fontWeight: 600 }}>Cloud Java Engine (Judge0)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.accent }}></div>
                        <span style={{ color: colors.text, fontWeight: 600 }}>Visual Data Rendering</span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        width: '100%', padding: '14px', borderRadius: '12px',
                        backgroundColor: colors.accent, color: '#000', border: 'none',
                        fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 5px 15px ${colors.accent}44`;
                    }}
                    onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    Sounds Great!
                </button>
            </div>
        </div>
    );
};

export default AboutModal;
