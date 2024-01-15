interface WebPhp {
    run(code: string): Promise<string>;
    addEventListener(event: string, callback: (event: { detail: string[] }) => void): void;
}

interface WebPython {
    runPython(code: string): string;
}

interface LanguageInterpreter {
    run(code: string): void;
}

class CustomEventFactory {
    static languageChangedEvent(language: string): CustomEvent {
        return new CustomEvent('lang:changed', { detail: language });
    }

    static outputEvent(output: string): CustomEvent {
        return new CustomEvent('lang:output', { detail: output });
    }

    static readyEvent(language: string): CustomEvent {
        return new CustomEvent('lang:ready', { detail: language });
    }

    static errorEvent(error: string): CustomEvent {
        return new CustomEvent('lang:error', { detail: error });
    }
}

class JavaScriptInterpreter implements LanguageInterpreter {
    constructor() {
        // dispatch the ready event
        window.dispatchEvent(CustomEventFactory.readyEvent('JavaScript ready!'));
    }

    run(code: string) {
        const oldLog = console.log;
        let result = '';
        console.log = (...args: any[]) => {
            // dispatch the output event
            result += args.join(' ') + '\n';
        }

        try {
            eval(code);
        } catch (e: any) {
            window.dispatchEvent(CustomEventFactory.errorEvent(`${e.name}: ${e.message}`));
            return;
        } finally {
            console.log = oldLog;
        }

        window.dispatchEvent(CustomEventFactory.outputEvent(result !== '' ? result : 'Success: No output!'));

    }
}

class PythonInterpreter implements LanguageInterpreter {
    private pyodide: WebPython | null;
    constructor() {
        this.pyodide = null;
        this.init();
    }

    async init() {
        // @ts-ignore
        this.pyodide = await loadPyodide();

        // dispatch the ready event
        window.dispatchEvent(CustomEventFactory.readyEvent('Python ready!'));

        // Pyodide is now ready to use...
        console.log(this.pyodide?.runPython(`
            import sys
            sys.version
        `));

    }

    run(code: string) {

        try {
            this.pyodide?.runPython(`
              import io
              sys.stdout = io.StringIO()
            `);
            let result = this.pyodide?.runPython(code);
            let stdout = this.pyodide?.runPython("sys.stdout.getvalue()");

            // dispatch the output event
            window.dispatchEvent(CustomEventFactory.outputEvent(stdout && stdout !== '' ? stdout : 'Success: No output!'));
        } catch (err: any) {
            window.dispatchEvent(CustomEventFactory.errorEvent(err));
        }
    }
}

class PHPInterpreter implements LanguageInterpreter {
    private php: WebPhp | null;
    constructor() {
        // @ts-ignore
        this.php = null;
        this.init();
    }

    async init() {
        // @ts-ignore
        const { PhpWeb } = await import('https://cdn.jsdelivr.net/npm/php-wasm/PhpWeb.mjs');
        this.php = new PhpWeb;
        this.php?.addEventListener('ready', () => {
            // dispatch the ready event
            window.dispatchEvent(CustomEventFactory.readyEvent('PHP ready!'));
        });

        // Listen to STDOUT
        this.php?.addEventListener('output', (event: { detail: string[] }) => {
            console.log(event);

            if(
                event.detail.join().split(':')[0]?.toLowerCase().includes('error') && event.detail.join().includes('error:')
                || event.detail.join().includes('thrown in') && event.detail.join().includes('on line')
                || event.detail.join().includes('Stack trace')
                || event.detail.join().includes('#0 {main}')
            ) {
                window.dispatchEvent(CustomEventFactory.errorEvent(event.detail.join()));
                return;
            }

            // emit the output event
            window.dispatchEvent(CustomEventFactory.outputEvent(event.detail && event.detail.join() !== '' ? event.detail.join() : 'Success: No output!'));
        });

        // Listen to STDERR
        this.php?.addEventListener('error', (event: { detail: string[] }) => {
            console.log(event);
            // emit the output event
            window.dispatchEvent(CustomEventFactory.errorEvent(event.detail.join()));
        });
    }

    run(code: string) {
        this.php?.run("<?php " + code);
    }
}

export class LanguageInterpreterFactory {
    static supportedLanguages = ['javascript', 'python', 'php'];

    static create(language: string): LanguageInterpreter {
        switch (language) {
            case 'javascript':
                return new JavaScriptInterpreter();
            case 'python':
                return new PythonInterpreter();
            case 'php':
                return new PHPInterpreter();
            default:
                throw new Error('Language not supported');
        }
    }
}

export class LanguageInterpreterService {
    private interpreters: Map<string, LanguageInterpreter>;

    public currentLanguage: string;
    public isReady: boolean = false;
    constructor() {
        this.interpreters = new Map();
        this.currentLanguage = 'javascript';

        window.addEventListener('lang:ready', () => {
            this.isReady = true;
        });
    }

    init() {
        this.interpreters.set(this.currentLanguage, new JavaScriptInterpreter());
        window.dispatchEvent(CustomEventFactory.languageChangedEvent(this.currentLanguage + ' ready!'));
    }

    get interpreter(): LanguageInterpreter {
        return this.interpreters.get(this.currentLanguage) ?? new JavaScriptInterpreter();
    }

    run(code: string) {
        this.interpreter.run(code);
    }

    setLanguage(language: string) {
        // check if the language is supported
        if (!LanguageInterpreterFactory.supportedLanguages.includes(language)) {
            throw new Error('Language not supported');
        }

        // check if the interpreter is already loaded
        if (!this.interpreters.has(language)) {
            this.isReady = false;
            this.interpreters.set(language, LanguageInterpreterFactory.create(language));
        }

        this.currentLanguage = language;

        // emit the language changed event
        window.dispatchEvent(CustomEventFactory.languageChangedEvent('Language set to: ' + language));
    }
}

export const languageInterpreterService = new LanguageInterpreterService();

