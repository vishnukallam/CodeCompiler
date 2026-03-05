import React from 'react';
import { Language, Theme, ThemeColors } from '../types';
import { templates } from '../constants';

interface HeaderProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    theme: Theme;
    toggleTheme: () => void;
    runCode: () => void;
    isRunning: boolean;
    isInitializing: boolean;
    setIsAboutOpen: (open: boolean) => void;
    colors: ThemeColors;
    setCode: (code: string) => void;
    xterm: any;
    setOutputTab: (tab: 'terminal' | 'visuals') => void;
}

const Header: React.FC<HeaderProps> = ({
    language, setLanguage, theme, toggleTheme, runCode,
    isRunning, isInitializing, setIsAboutOpen, colors,
    setCode, xterm, setOutputTab
}) => {
    return (
        <header style={{
            height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 30px', backgroundColor: colors.headerBg,
            borderBottom: `1px solid ${colors.border}`, zIndex: 10,
            boxShadow: `0 2px 10px ${colors.shadow}`,
            transition: 'all 0.4s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '1.6rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span className="premium-gradient-title">
                            <span className="stylish-c-1">C</span>ode <span className="stylish-c-2">C</span>ompiler
                        </span>
                    </h1>
                    <button
                        onClick={() => setIsAboutOpen(true)}
                        style={{
                            background: 'none', color: colors.accent,
                            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                            padding: '5px 10px', borderRadius: '6px', transition: 'all 0.3s',
                            border: `1px solid ${colors.accent}44`
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = `${colors.accent}11`;
                            e.currentTarget.style.borderColor = colors.accent;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = `${colors.accent}44`;
                        }}
                    >
                        About
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={language}
                        onChange={(e) => {
                            const lang = e.target.value as Language;
                            setLanguage(lang);
                            sessionStorage.setItem('last_language', lang);

                            const savedCode = sessionStorage.getItem(`code_${lang}`);
                            if (savedCode) {
                                setCode(savedCode);
                            } else {
                                setCode(templates[lang]);
                            }

                            xterm.current?.clear();
                            setOutputTab('terminal');
                        }}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', backgroundColor: colors.surface,
                            color: colors.text, border: `1px solid ${colors.border}`, cursor: 'pointer',
                            fontWeight: 700, outline: 'none', transition: 'all 0.3s ease',
                            boxShadow: `0 2px 4px ${colors.shadow}`
                        }}
                        onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'light' ? '#2196F3' : '#47cf73'}`}
                        onBlur={(e) => e.currentTarget.style.boxShadow = `0 2px 4px ${colors.shadow}`}
                    >
                        <option value="python">Python 3</option>
                        <option value="java">Java 13</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div
                    onClick={toggleTheme}
                    style={{
                        width: '56px', height: '28px',
                        backgroundColor: theme === 'dark' ? '#2c3e50' : '#bdc3c7',
                        borderRadius: '20px', position: 'relative', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        transition: 'background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{
                        width: '22px', height: '22px',
                        backgroundColor: theme === 'dark' ? '#fff' : '#333',
                        borderRadius: '50%',
                        position: 'absolute', left: theme === 'dark' ? '30px' : '4px',
                        transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        zIndex: 2
                    }}>
                    </div>
                </div>

                <button
                    onClick={runCode}
                    disabled={isInitializing || isRunning}
                    style={{
                        backgroundColor: '#0056b3', color: 'white', border: 'none',
                        padding: '8px 20px', cursor: (isInitializing || isRunning) ? 'not-allowed' : 'pointer',
                        borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem',
                        transition: 'all 0.3s ease', opacity: (isInitializing || isRunning) ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    {isRunning ? (
                        'EXECUTING...'
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Run
                        </>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;
