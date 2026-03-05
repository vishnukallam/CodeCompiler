import React from 'react';
import Editor from '@monaco-editor/react';
import { Language, ThemeColors } from '../types';
import { getFileName } from '../constants';

interface EditorContainerProps {
    language: Language;
    theme: 'dark' | 'light';
    code: string;
    setCode: (code: string) => void;
    colors: ThemeColors;
}

const EditorContainer: React.FC<EditorContainerProps> = ({
    language, theme, code, setCode, colors
}) => {
    return (
        <div style={{
            flex: 1.2, borderRadius: '12px', overflow: 'hidden',
            backgroundColor: theme === 'light' ? '#ffffff' : colors.surface,
            boxShadow: theme === 'light'
                ? '0 4px 20px rgba(0,0,0,0.08)'
                : `0 8px 32px ${colors.shadow}`,
            border: `1px solid ${colors.border}`,
            display: 'flex', flexDirection: 'column',
            transition: 'all 0.4s ease'
        }}>
            <div style={{
                height: '40px', display: 'flex', alignItems: 'center',
                backgroundColor: theme === 'light' ? '#f0f2f5' : '#1a1a1a',
                borderBottom: `1px solid ${colors.border}`
            }}>
                <div style={{
                    height: '100%', padding: '0 20px', display: 'flex', alignItems: 'center',
                    backgroundColor: theme === 'light' ? '#ffffff' : colors.surface,
                    borderRight: `1px solid ${colors.border}`,
                    fontSize: '0.85rem', fontWeight: 600, color: colors.text
                }}>
                    {getFileName(language)}
                </div>
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
                <Editor
                    height="100%"
                    language={language}
                    theme={colors.editorTheme}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 15,
                        padding: { top: 20 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontFamily: '"Fira Code", monospace',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        renderLineHighlight: 'all',
                        lineHeight: 1.6,
                        lineNumbers: 'on',
                        scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
                        quickSuggestions: { other: true, comments: true, strings: true },
                        quickSuggestionsDelay: 0,
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        parameterHints: { enabled: true },
                        formatOnType: true,
                        autoClosingBrackets: 'always',
                        autoClosingQuotes: 'always',
                        autoClosingOvertype: 'always',
                        autoIndent: 'advanced',
                        wordBasedSuggestions: 'allDocuments',
                        suggest: {
                            showFunctions: true,
                            showKeywords: true,
                            showModules: true,
                            showSnippets: true,
                            showClasses: true,
                            showColors: true,
                            showConstants: true,
                            showConstructors: true,
                            showEvents: true,
                            showFields: true,
                            showFiles: true,
                            showFolders: true,
                            showInterfaces: true,
                            showIssues: true,
                            showMethods: true,
                            showOperators: true,
                            showProperties: true,
                            showReferences: true,
                            showStructs: true,
                            showTypeParameters: true,
                            showUnits: true,
                            showUsers: true,
                            showValues: true,
                            showVariables: true,
                            showWords: true
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default EditorContainer;
