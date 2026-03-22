/**
 * Local Execution Engine
 * Runs Python and Java code via child_process with:
 *  - Real-time stdout/stderr streaming
 *  - Stdin forwarding (interactive input)
 *  - Automatic pip installation for unknown packages
 *  - Matplotlib / visual output capture to base64
 */

const { spawn, exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

const TEMP_DIR = path.join(__dirname, 'temp');
const LIB_DIR = path.join(__dirname, 'lib');

const MAVEN_JARS = {
    'org.json': {
        url: 'https://repo1.maven.org/maven2/org/json/json/20240303/json-20240303.jar',
        filename: 'json-20240303.jar'
    },
    'com.google.gson': {
        url: 'https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar',
        filename: 'gson-2.10.1.jar'
    },
    'org.jsoup': {
        url: 'https://repo1.maven.org/maven2/org/jsoup/jsoup/1.17.2/jsoup-1.17.2.jar',
        filename: 'jsoup-1.17.2.jar'
    },
    'org.apache.commons.lang3': {
        url: 'https://repo1.maven.org/maven2/org/apache/commons/commons-lang3/3.14.0/commons-lang3-3.14.0.jar',
        filename: 'commons-lang3-3.14.0.jar'
    }
};

const https = require('https');

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
}

// Python stdlib — do not try to pip install these
const PYTHON_STDLIB = new Set([
    'sys', 'os', 'math', 'json', 're', 'datetime', 'time', 'random',
    'collections', 'itertools', 'functools', 'string', 'io', 'abc',
    'copy', 'traceback', 'pathlib', 'inspect', 'logging', 'argparse',
    'typing', 'enum', 'dataclasses', 'contextlib', 'threading', 'queue',
    'hashlib', 'hmac', 'base64', 'struct', 'binascii', 'csv', 'sqlite3',
    'http', 'urllib', 'email', 'html', 'xml', 'subprocess', 'shutil',
    'glob', 'tempfile', 'uuid', 'platform', 'gc', 'weakref', 'ast',
    'decimal', 'fractions', 'statistics', 'operator', 'heapq', 'bisect',
    'warnings', 'pdb', 'unittest', 'doctest', 'token', 'tokenize',
    'dis', 'builtins', '__future__', 'types', 'abc', 'codecs', 'getopt',
    'getpass', 'gettext', 'locale', 'optparse', 'signal', 'socket',
    'ssl', 'select', 'selectors', 'asyncio', 'concurrent', 'multiprocessing',
    'importlib', 'pkgutil', 'zipfile', 'tarfile', 'gzip', 'bz2', 'lzma',
    'zlib', 'binascii', 'struct', 'array', 'mmap', 'ctypes', 'cProfile',
    'profile', 'timeit', 'trace', 'tracemalloc', 'gc', 'pickle', 'shelve',
    'configparser', 'netrc', 'ftplib', 'smtplib', 'imaplib', 'poplib',
    'xmlrpc', 'socketserver', 'http', 'tkinter', 'curses', 'readline',
]);

// pip install name aliases
const PIP_ALIAS = {
    cv2: 'opencv-python',
    PIL: 'Pillow',
    sklearn: 'scikit-learn',
    bs4: 'beautifulsoup4',
    yaml: 'pyyaml',
    dotenv: 'python-dotenv',
    serial: 'pyserial',
    Crypto: 'pycryptodome',
};

function resolvePackages(code) {
    const pkgs = new Set();
    const re = /^(?:import|from)\s+([a-zA-Z0-9_]+)/gm;
    let m;
    while ((m = re.exec(code)) !== null) {
        const mod = m[1];
        if (!PYTHON_STDLIB.has(mod)) {
            pkgs.add(PIP_ALIAS[mod] || mod);
        }
    }
    return Array.from(pkgs);
}

async function installPackages(packages, onStatus) {
    for (const pkg of packages) {
        onStatus?.(`Installing package: ${pkg}...`);
        await new Promise((resolve) => {
            exec(`${pythonCmd} -m pip install ${pkg} --quiet`, (err, stdout, stderr) => {
                if (err) {
                    onStatus?.(`Warning: Failed to install ${pkg}`);
                }
                resolve();
            });
        });
    }
}

/**
 * Execute Python with:
 * - auto pip install
 * - real-time streaming
 * - stdin forwarding
 * - matplotlib capture
 * Returns the child process for stdin piping.
 */
async function executePython(code, { onOutput, onError, onStatus } = {}) {
    await fs.ensureDir(TEMP_DIR);

    const packages = resolvePackages(code);
    if (packages.length > 0) {
        await installPackages(packages, onStatus);
    }

    const hasMatplotlib = /matplotlib|seaborn/.test(code);

    // Wrap code to capture matplotlib figures
    let finalCode = code;
    if (hasMatplotlib) {
        finalCode = `
import sys as _sys
import io as _io
import base64 as _b64
import matplotlib as _mpl
_mpl.use('Agg')

${code}

# --- Capture plot output ---
try:
    import matplotlib.pyplot as _plt
    _buf = _io.BytesIO()
    _plt.savefig(_buf, format='png', bbox_inches='tight')
    _buf.seek(0)
    _b64str = _b64.b64encode(_buf.read()).decode('utf-8')
    print("VISUAL_OUTPUT:" + _b64str, file=_sys.stderr)
    _plt.close('all')
except Exception:
    pass
`;
    }

    const runId = uuidv4();
    const scriptPath = path.join(TEMP_DIR, `${runId}.py`);
    await fs.writeFile(scriptPath, finalCode, 'utf8');

    onStatus?.('Running...');

    return new Promise((resolve) => {
        const proc = spawn(pythonCmd, [scriptPath], {
            cwd: TEMP_DIR,
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        });

        proc.stdout.on('data', (data) => onOutput?.(data.toString('utf8')));
        proc.stderr.on('data', (data) => {
            const s = data.toString('utf8');
            // Separate visual markers from real errors
            const lines = s.split('\n');
            const errs = [];
            for (const line of lines) {
                if (line.startsWith('VISUAL_OUTPUT:')) {
                    onOutput?.(line);  // Forward to stdout handler for visual processing
                } else if (line.trim()) {
                    errs.push(line);
                }
            }
            if (errs.length > 0) onError?.(errs.join('\n'));
        });

        proc.on('close', (code) => {
            fs.remove(scriptPath).catch(() => { });
            onStatus?.(code === 0 ? 'Success' : `Exited with code ${code}`);
            resolve(null);
        });

        proc.on('error', (err) => {
            onError?.(`Failed to start Python: ${err.message}`);
            onStatus?.('Error');
            resolve(null);
        });

        resolve(proc);
    });
}

/**
 * Execute Java with:
 * - javac compile step (errors reported)
 * - real-time streaming
 * - stdin forwarding
 * - classpath with downloaded JARs
 */
async function executeJava(code, { onOutput, onError, onStatus } = {}) {
    await fs.ensureDir(TEMP_DIR);
    await fs.ensureDir(LIB_DIR);

    const cleanedCode = code.replace(/^[ \t]*package[ \t]+[a-zA-Z0-9._]+[ \t]*;/gm, '').trim();
    const classMatch = cleanedCode.match(/public\s+class\s+(\w+)/);
    const className = classMatch ? classMatch[1] : 'Main';

    const runId = uuidv4();
    const workDir = path.join(TEMP_DIR, runId);
    await fs.ensureDir(workDir);

    const sourceFile = path.join(workDir, `${className}.java`);
    await fs.writeFile(sourceFile, cleanedCode, 'utf8');

    // Handle package installations
    const importRe = /^import\s+([a-zA-Z0-9_.]+);/gm;
    let m2;
    const requiredJars = new Set();
    while ((m2 = importRe.exec(cleanedCode)) !== null) {
        const importPath = m2[1];
        // Match base packages
        for (const [pkgPrefix, jarInfo] of Object.entries(MAVEN_JARS)) {
            if (importPath.startsWith(pkgPrefix)) {
                requiredJars.add(jarInfo);
            }
        }
    }

    if (requiredJars.size > 0) {
        for (const jarInfo of requiredJars) {
            const jarPath = path.join(LIB_DIR, jarInfo.filename);
            if (!(await fs.pathExists(jarPath))) {
                onStatus?.(`Downloading dependencies from cloud...`);
                try {
                    await downloadFile(jarInfo.url, jarPath);
                } catch (e) {
                    onStatus?.(`Warning: Failed to download JAR: ${e.message}`);
                }
            }
        }
    }

    const sep = process.platform === 'win32' ? ';' : ':';
    const jars = (await fs.readdir(LIB_DIR))
        .filter(f => f.endsWith('.jar'))
        .map(f => path.join(LIB_DIR, f));
    const classpath = [workDir, ...jars].join(sep);

    // Compile
    onStatus?.('Compiling...');
    const compileResult = await new Promise((resolve) => {
        exec(`javac -cp "${classpath}" "${sourceFile}"`, (err, stdout, stderr) => {
            resolve({ err, stdout, stderr });
        });
    });

    if (compileResult.err) {
        onError?.(compileResult.stderr || compileResult.stdout);
        onStatus?.('Compilation Error');
        fs.remove(workDir).catch(() => { });
        return null;
    }

    onStatus?.('Running...');

    return new Promise((resolve) => {
        const proc = spawn('java', ['-cp', classpath, className], {
            cwd: workDir,
        });

        proc.stdout.on('data', (data) => onOutput?.(data.toString('utf8')));
        proc.stderr.on('data', (data) => onError?.(data.toString('utf8')));

        proc.on('close', (code) => {
            fs.remove(workDir).catch(() => { });
            onStatus?.(code === 0 ? 'Success' : `Exited with code ${code}`);
            resolve(null);
        });

        proc.on('error', (err) => {
            onError?.(`Failed to start Java: ${err.message}`);
            onStatus?.('Error');
            resolve(null);
        });

        resolve(proc);
    });
}

module.exports = { executePython, executeJava };
