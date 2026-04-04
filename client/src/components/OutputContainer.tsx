import React from 'react';
import { Language, ThemeColors } from '../types';

interface OutputContainerProps {
    theme: 'dark' | 'light';
    colors: ThemeColors;
    outputTab: 'terminal' | 'visuals';
    setOutputTab: (tab: 'terminal' | 'visuals') => void;
    plotImage: string | null;
    terminalRef: React.RefObject<HTMLDivElement>;
    copyTerminalOutput: () => void;
    clearTerminal: () => void;
    language: Language;
}

const OutputContainer: React.FC<OutputContainerProps> = ({
    theme, colors, outputTab, setOutputTab, plotImage,
    terminalRef, copyTerminalOutput, clearTerminal, language
}) => {
    return (
        <div className="premium-card" style={{
            flex: 0.8, display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: theme === 'dark' ? 'rgba(39, 41, 61, 0.7)' : '#ffffff',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <div style={{
                height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.1)' : '#f0f2f5',
                borderBottom: `1px solid ${colors.border}`,
                transition: 'all 0.4s ease'
            }}>
                <div style={{ display: 'flex', gap: '15px', height: '100%' }}>
                    <button
                        onClick={() => setOutputTab('terminal')}
                        style={{
                            padding: '0 5px', border: 'none', background: 'none',
                            color: outputTab === 'terminal' ? colors.accent : colors.textMuted,
                            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                            borderBottom: outputTab === 'terminal' ? `3px solid ${colors.accent}` : 'none',
                            transition: 'all 0.3s',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                    >
                        Terminal
                    </button>
                    {(language === 'python' || language === 'java') && (
                        <button
                            onClick={() => setOutputTab('visuals')}
                            style={{
                                padding: '0 5px', border: 'none', background: 'none',
                                color: outputTab === 'visuals' ? colors.accent : colors.textMuted,
                                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                borderBottom: outputTab === 'visuals' ? `3px solid ${colors.accent}` : 'none',
                                transition: 'all 0.3s',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            Visuals {plotImage && '●'}
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={copyTerminalOutput}
                        style={{
                            padding: '6px 15px', borderRadius: '20px', 
                            border: `1px solid ${colors.border}`,
                            backgroundColor: 'rgba(255,255,255,0.05)', color: colors.text, cursor: 'pointer',
                            fontSize: '0.7rem', fontWeight: 600, transition: 'all 0.2s',
                            textTransform: 'uppercase'
                        }}
                        onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = `${colors.accent}22`}
                        onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    >
                        Copy
                    </button>
                    <button
                        onClick={clearTerminal}
                        style={{
                            padding: '6px 15px', borderRadius: '20px', 
                            border: `1px solid ${colors.border}`,
                            backgroundColor: 'rgba(255,255,255,0.05)', color: colors.text, cursor: 'pointer',
                            fontSize: '0.7rem', fontWeight: 600, transition: 'all 0.2s',
                            textTransform: 'uppercase'
                        }}
                        onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(255,0,0,0.1)'}
                        onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    >
                        Clear
                    </button>
                </div>
            </div>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    visibility: outputTab === 'terminal' ? 'visible' : 'hidden',
                    padding: '20px'
                }} ref={terminalRef} />

                {outputTab === 'visuals' && (
                    <div style={{
                        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: '30px'
                    }}>
                        {plotImage ? (
                            <img
                                src={plotImage}
                                alt="Visual Output"
                                style={{
                                    maxWidth: '100%', maxHeight: '100%',
                                    borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                    border: `1px solid ${colors.border}`
                                }}
                            />
                        ) : (
                            <div style={{ color: colors.textMuted, fontSize: '0.9rem', fontStyle: 'italic' }}>
                                No visual output to display
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputContainer;
