import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

// Types & Constants
import { Language, Theme } from './types';
import { templates, themeConfig } from './constants';

// Hooks
import { useCodeExecution } from './hooks/useCodeExecution';

// Components
import Header from './components/Header';
import EditorContainer from './components/EditorContainer';
import OutputContainer from './components/OutputContainer';
import AboutModal from './components/AboutModal';
import FileExplorer from './components/FileExplorer';

function App() {

  const [language, setLanguage] = useState<Language>(() => {
    return (sessionStorage.getItem('last_language') as Language) || 'python';
  });

  const [theme, setTheme] = useState<Theme>('dark');

  const [code, setCode] = useState(() => {
    const lastLang = (sessionStorage.getItem('last_language') as Language) || 'python';
    const savedCode = sessionStorage.getItem(`code_${lastLang}`);
    return savedCode || templates[lastLang];
  });

  const [outputTab, setOutputTab] = useState<'terminal' | 'visuals'>('terminal');
  const [plotImage, setPlotImage] = useState<string | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const xterm = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const colors = themeConfig[theme];

  const { isRunning, isInitializing, initPyodide, runCode } = useCodeExecution(
    language,
    code,
    xterm,
    setPlotImage,
    setOutputTab
  );

  // Save code whenever it changes
  useEffect(() => {
    sessionStorage.setItem(`code_${language}`, code);
  }, [code, language]);

  // Save last selected language
  useEffect(() => {
    sessionStorage.setItem('last_language', language);
  }, [language]);

  // Fix corrupted Java sessionStorage
  useEffect(() => {

    const javaCode = sessionStorage.getItem('code_java');

    if (javaCode === templates.python) {

      sessionStorage.setItem('code_java', templates.java);

      if (language === 'java') {
        setCode(templates.java);
      }

    }

  }, [language]);

  // Initialize Terminal (runs only once)
  useLayoutEffect(() => {

    if (!terminalRef.current || xterm.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
        cursor: '#47cf73',
        selectionBackground: '#2196F380',
      },
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      rows: 20,
      convertEol: true
    });

    const fit = new FitAddon();

    term.loadAddon(fit);
    term.open(terminalRef.current);

    xterm.current = term;
    fitAddon.current = fit;

    const timer = setTimeout(() => {

      if (fitAddon.current && terminalRef.current?.offsetWidth! > 0) {
        try { fitAddon.current.fit(); } catch (e) {}
      }

    }, 200);

    const resizeObserver = new ResizeObserver(() => {

      if (fitAddon.current && terminalRef.current?.offsetWidth! > 0) {
        try { fitAddon.current.fit(); } catch (e) {}
      }

    });

    resizeObserver.observe(terminalRef.current);

    term.writeln('\x1b[1;32mCode Compiler Ready\x1b[0m');

    initPyodide();

    return () => {

      clearTimeout(timer);
      resizeObserver.disconnect();

      term.dispose();

      xterm.current = null;
      fitAddon.current = null;

    };

  }, [initPyodide]);

  // Update terminal theme dynamically
  useEffect(() => {

    if (xterm.current) {

      xterm.current.options.theme = {
        background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        foreground: theme === 'dark' ? '#ffffff' : '#202124',
        cursor: theme === 'dark' ? '#47cf73' : '#2196F3',
        selectionBackground: '#2196F380',
      };

    }

  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const copyTerminalOutput = () => {

    if (xterm.current) {

      xterm.current.selectAll();
      const selection = xterm.current.getSelection();

      if (selection) {

        navigator.clipboard.writeText(selection);

        xterm.current.clearSelection();

        xterm.current.writeln('\x1b[1;32m\r\nOutput Copied to Clipboard!\x1b[0m');

      }

    }

  };

  const clearTerminal = () => xterm.current?.clear();

  return (

    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: colors.bg,
      color: colors.text,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden'
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap');

        body {
          margin: 0;
          padding: 0;
          overflow: hidden !important;
          font-family: 'Inter', sans-serif;
          background: ${colors.bg};
          background-image: ${theme === 'dark' 
            ? 'radial-gradient(circle at 50% 50%, #1e1e2f 0%, #171941 100%)' 
            : 'radial-gradient(circle at 50% 50%, #f4f5f7 0%, #e3e4e9 100%)'};
        }

        .premium-card {
          background: ${colors.surface} !important;
          border-radius: 12px !important;
          border: 1px solid ${colors.border} !important;
          box-shadow: ${colors.shadow} !important;
          backdrop-filter: blur(10px) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .premium-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.45) !important;
        }

        .premium-gradient-title {
          background: linear-gradient(to right, ${colors.accent}, #ba54f5) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          letter-spacing: -0.5px;
          animation: titleGlow 3s ease-in-out infinite alternate !important;
        }

        @keyframes titleGlow {
          from { filter: drop-shadow(0 0 2px ${colors.accent}44); }
          to { filter: drop-shadow(0 0 8px ${colors.accent}aa); }
        }

        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        *::-webkit-scrollbar {
          display: none;
        }

        .glass-header {
          background: ${colors.headerBg} !important;
          backdrop-filter: blur(15px) !important;
          border-bottom: 1px solid ${colors.border} !important;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .btn-premium {
          background: linear-gradient(135deg, ${colors.accent}, #ba54f5) !important;
          border: none !important;
          color: white !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          box-shadow: 0 4px 15px 0 ${colors.accent}44 !important;
        }

        .btn-premium:hover {
           transform: scale(1.05);
           box-shadow: 0 6px 20px 0 ${colors.accent}66 !important;
        }

        .btn-premium:active {
           transform: scale(0.95);
        }
      `}</style>

      <Header
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
        runCode={runCode}
        isRunning={isRunning}
        isInitializing={isInitializing}
        setIsAboutOpen={setIsAboutOpen}
        colors={colors}
        setCode={setCode}
        xterm={xterm}
        setOutputTab={setOutputTab}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        <FileExplorer 
          colors={colors}
          theme={theme}
        />

        <div style={{ display: 'flex', flex: 1, minHeight: 0, padding: '15px', gap: '15px' }}>
          <EditorContainer
            language={language}
            theme={theme}
            code={code}
            setCode={setCode}
            colors={colors}
          />

          <OutputContainer
            theme={theme}
            colors={colors}
            outputTab={outputTab}
            setOutputTab={setOutputTab}
            plotImage={plotImage}
            terminalRef={terminalRef}
            copyTerminalOutput={copyTerminalOutput}
            clearTerminal={clearTerminal}
            language={language}
          />
        </div>

      </div>

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        colors={colors}
      />

    </div>

  );
}

export default App;
