import { Language, ThemeConfig } from './types';

export const templates: Record<Language, string> = {
    python: `print("Welcome to Code Compiler.")`,
    java: `class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Code Compiler.");
    }
}`
};

export const themeConfig: ThemeConfig = {
    dark: {
        bg: '#121212',
        surface: '#1e1e1e',
        accent: '#47cf73',
        text: '#ffffff',
        textMuted: '#a0a0a0',
        headerBg: '#1a1a1a',
        buttonColor: '#ffffff',
        border: '#333333',
        shadow: 'rgba(0,0,0,0.5)',
        editorTheme: 'vs-dark'
    },
    light: {
        bg: '#f8f9fa',
        surface: '#ffffff',
        accent: '#2196F3',
        text: '#202124',
        textMuted: '#5f6368',
        headerBg: '#ffffff',
        buttonColor: '#ffffff',
        border: '#dadce0',
        shadow: 'rgba(0,0,0,0.06)',
        editorTheme: 'light',
        premiumShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
    }
};

export const getFileName = (lang: string) => {
    switch (lang) {
        case 'python': return 'main.py';
        case 'java': return 'Main.java';
        default: return 'main.txt';
    }
};

export const API_URL = process.env.REACT_APP_API_URL || 'https://codecompiler-cewu.onrender.com';

