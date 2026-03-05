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
        <div style={{
            flex: 0.8, display: 'flex', flexDirection: 'column',
            borderRadius: '15px', overflow: 'hidden',
            backgroundColor: colors.surface,
            boxShadow: theme === 'light'
                ? '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 8px 15px -6px rgba(0, 0, 0, 0.05)'
                : `0 8px 32px ${colors.shadow}`,
            border: `1px solid ${colors.border}`,
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <div style={{
                height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 10px', backgroundColor: theme === 'light' ? '#f0f2f5' : '#1a1a1a',
                borderBottom: `1px solid ${colors.border}`,
                transition: 'all 0.4s ease'
            }}>
                <div style={{ display: 'flex', gap: '5px', height: '100%' }}>
                    <button
                        onClick={() => setOutputTab('terminal')}
                        style={{
                            padding: '0 15px', border: 'none', background: 'none',
                            color: outputTab === 'terminal' ? colors.accent : colors.textMuted,
                            fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                            borderBottom: outputTab === 'terminal' ? `2px solid ${colors.accent}` : 'none',
                            transition: 'all 0.3s'
                        }}
                    >
                        TERMINAL
                    </button>
                    {(language === 'python' || language === 'java') && (
                        <button
                            onClick={() => setOutputTab('visuals')}
                            style={{
                                padding: '0 15px', border: 'none', background: 'none',
                                color: outputTab === 'visuals' ? colors.accent : colors.textMuted,
                                fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                                borderBottom: outputTab === 'visuals' ? `2px solid ${colors.accent}` : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            VISUALS {plotImage && '●'}
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={copyTerminalOutput}
                        style={{
                            padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`,
                            backgroundColor: colors.surface, color: colors.text, cursor: 'pointer',
                            fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f8f9fa' : '#2a2a2a'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.surface}
                    >
                        COPY
                    </button>
                    <button
                        onClick={clearTerminal}
                        style={{
                            padding: '4px 12px', borderRadius: '4px', border: `1px solid ${colors.border}`,
                            backgroundColor: colors.surface, color: colors.text, cursor: 'pointer',
                            fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = theme === 'light' ? '#f8f9fa' : '#2a2a2a'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.surface}
                    >
                        CLEAR
                    </button>
                </div>
            </div>
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    visibility: outputTab === 'terminal' ? 'visible' : 'hidden',
                    padding: '15px'
                }} ref={terminalRef} />

                {outputTab === 'visuals' && (
                    <div style={{
                        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#1e1e1e',
                        padding: '20px'
                    }}>
                        {plotImage ? (
                            <img
                                src={plotImage}
                                alt="Visual Output"
                                style={{
                                    maxWidth: '100%', maxHeight: '100%',
                                    borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}
                            />
                        ) : (
                            <div style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>No visual output to display</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OutputContainer;
