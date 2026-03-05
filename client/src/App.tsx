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

  // Initialize Terminal
  useLayoutEffect(() => {

    if (!terminalRef.current || xterm.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        foreground: theme === 'dark' ? '#ffffff' : '#202124',
        cursor: theme === 'dark' ? '#47cf73' : '#2196F3',
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initPyodide]);

  // Theme update for terminal
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
        .premium-gradient-title {
          color: ${theme === 'light' ? '#000000' : colors.accent} !important;
          text-shadow: ${theme === 'light' ? 'none' : `0 0 10px ${colors.accent}, 0 0 20px ${colors.accent}44`} !important;
          animation: ${theme === 'light' ? 'none' : 'titleGlow 3s ease-in-out infinite alternate'} !important;
          display: inline-block !important;
        }

        @keyframes titleGlow {
          from { text-shadow: 0 0 5px ${colors.accent}, 0 0 10px ${colors.accent}22; }
          to { text-shadow: 0 0 15px ${colors.accent}, 0 0 30px ${colors.accent}88; }
        }

        .stylish-c-1 {
          font-family: "Playfair Display", serif !important;
          font-style: italic !important;
          font-weight: 900 !important;
          font-size: 1.2em !important;
          margin-right: -1px !important;
          color: ${theme === 'light' ? '#000000' : colors.accent} !important;
        }

        .stylish-c-2 {
          font-family: "Georgia", serif !important;
          font-style: italic !important;
          font-weight: 900 !important;
          font-size: 1.1em !important;
          margin-right: -1px !important;
          color: ${theme === 'light' ? '#000000' : colors.accent} !important;
        }

        body {
          margin: 0;
          padding: 0;
          overflow: hidden !important;
        }

        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        *::-webkit-scrollbar {
          display: none;
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

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        colors={colors}
      />

    </div>

  );
}

export default App;
