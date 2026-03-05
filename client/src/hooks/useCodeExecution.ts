import { useState, useCallback, useEffect, useRef, MutableRefObject } from 'react';
import { Terminal } from '@xterm/xterm';
import { io, Socket } from 'socket.io-client';
import { Language } from '../types';
import { API_URL } from '../constants';

// Declare global for Pyodide (kept for fallback/reuse)
declare global {
    interface Window { loadPyodide: any; }
}

export const useCodeExecution = (
    language: Language,
    code: string,
    xterm: MutableRefObject<Terminal | null>,
    setPlotImage: (img: string | null) => void,
    setOutputTab: (tab: 'terminal' | 'visuals') => void
) => {
    const [isRunning, setIsRunning] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Initialize Socket.IO connection to backend
    useEffect(() => {
        const socket = io(API_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('stdout', (data: string) => {
            // Check if stdout contains a visual output marker
            if (data.includes('VISUAL_OUTPUT:')) {
                const b64 = data.replace('VISUAL_OUTPUT:', '').trim();
                setPlotImage('data:image/png;base64,' + b64);
                setOutputTab('visuals');
            } else {
                xterm.current?.write('\x1b[36m' + data + '\x1b[0m');
            }
        });

        socket.on('stderr', (data: string) => {
            xterm.current?.write('\x1b[33m' + data + '\x1b[0m');
        });

        socket.on('status', (status: string) => {
            xterm.current?.writeln('\r\n\x1b[90m[' + status + ']\x1b[0m');
            if (
                status === 'Success' ||
                status.includes('Exited') ||
                status.includes('Error') ||
                status === 'Compilation Error'
            ) {
                setIsRunning(false);
            }
        });

        socket.on('error', (err: string) => {
            xterm.current?.writeln('\x1b[31mServer Error: ' + err + '\x1b[0m');
            setIsRunning(false);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        return () => {
            socket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [API_URL]);

    // Enable terminal keyboard input forwarding (for stdin programs)
    useEffect(() => {
        if (!xterm.current) return;
        const terminal = xterm.current;
        const disposable = terminal.onData((data: string) => {
            if (isRunning && socketRef.current?.connected) {
                if (data === '\r') terminal.write('\n');
                else terminal.write(data);
                socketRef.current.emit('input', data);
            }
        });
        return () => disposable.dispose();
    }, [isRunning, xterm]);

    // initPyodide is kept as a no-op since we move all execution to the cloud
    const initPyodide = useCallback(async () => {
        setIsInitializing(false);
        xterm.current?.writeln('\x1b[32mCloud Execution Engine Ready\x1b[0m');
    }, [xterm]);

    const runCode = useCallback(() => {
        if (!socketRef.current?.connected) {
            xterm.current?.writeln('\x1b[31mError: Not connected to server. Please wait...\x1b[0m');
            return;
        }

        setIsRunning(true);
        setPlotImage(null);
        setOutputTab('terminal');
        xterm.current?.clear();
        xterm.current?.writeln('\x1b[90mStarting Cloud Process (' + language.toUpperCase() + ')...\x1b[0m');

        let processedCode = code;
        if (language === 'java') {
            processedCode = code.replace(/^[ \t]*package[ \t]+[a-zA-Z0-9._]+[ \t]*;/gm, '').trim();
        }

        socketRef.current.emit('run-code', { language, code: processedCode });
    }, [code, language, setOutputTab, setPlotImage, xterm]);

    return { isRunning, isInitializing, initPyodide, runCode };
};
