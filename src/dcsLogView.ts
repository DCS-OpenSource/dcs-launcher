import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { StringDecoder } from "string_decoder";
import * as vscode from "vscode";

const maxInitialBytes = 2 * 1024 * 1024;
const maxLines = 20_000;
const readChunkBytes = 256 * 1024;

export function getDcsLogPath(homeDirectory?: string): string {
    const home = homeDirectory ?? process.env.USERPROFILE ?? os.homedir();
    return path.join(home, "Saved Games", "DCS", "Logs", "dcs.log");
}

export class DcsLogView implements vscode.Disposable {
    private panel?: vscode.WebviewPanel;
    private timer?: NodeJS.Timeout;
    private reading = false;
    private position = 0;
    private fileIdentity?: string;
    private partialLine = "";
    private decoder = new StringDecoder("utf8");
    private lastStatus?: string;
    private readonly logPath = getDcsLogPath();

    show(): void {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Active);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            "dcsLauncher.log",
            "DCS Log",
            vscode.ViewColumn.Active,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        this.panel = panel;
        panel.webview.html = this.getHtml(panel.webview);
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case "ready":
                    this.refreshConfiguration();
                    void this.startFollowing();
                    break;

                case "configureExclusions":
                    void vscode.commands.executeCommand(
                        "workbench.action.openSettings",
                        "@ext:DCS-OpenSource.dcs-launcher dcsLauncher.logExcludedPatterns"
                    );
                    break;
            }
        }, undefined, [panel]);
        panel.onDidDispose(() => {
            this.stopFollowing();
            this.panel = undefined;
        }, undefined, [panel]);
    }

    dispose(): void {
        this.stopFollowing();
        this.panel?.dispose();
    }

    refreshConfiguration(): void {
        const patterns = vscode.workspace
            .getConfiguration("dcsLauncher")
            .get<string[]>("logExcludedPatterns") ?? [];

        void this.panel?.webview.postMessage({
            command: "configuration",
            excludedPatterns: patterns
        });
    }

    private async startFollowing(): Promise<void> {
        this.stopFollowing();
        this.resetReader();
        await this.poll();
        this.timer = setInterval(() => void this.poll(), 500);
    }

    private stopFollowing(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    private resetReader(): void {
        this.position = 0;
        this.fileIdentity = undefined;
        this.partialLine = "";
        this.decoder = new StringDecoder("utf8");
        this.lastStatus = undefined;
    }

    private async poll(): Promise<void> {
        if (this.reading || !this.panel) {
            return;
        }

        this.reading = true;

        try {
            const stat = await fs.promises.stat(this.logPath);
            const identity = `${stat.birthtimeMs}:${stat.ino}`;

            if (!this.fileIdentity || this.fileIdentity !== identity || stat.size < this.position) {
                await this.loadInitial(stat.size, identity);
                return;
            }

            if (stat.size > this.position) {
                await this.readAppendedBytes(stat.size);
            }

            this.setStatus(`Following ${this.logPath}`);
        } catch (error) {
            const code = (error as NodeJS.ErrnoException).code;
            if (code === "ENOENT") {
                if (this.fileIdentity) {
                    this.resetReader();
                    void this.panel?.webview.postMessage({ command: "reset", lines: [] });
                }
                this.setStatus(`Waiting for ${this.logPath}`);
            } else {
                this.setStatus(`Unable to read log: ${String(error)}`, true);
            }
        } finally {
            this.reading = false;
        }
    }

    private async loadInitial(size: number, identity: string): Promise<void> {
        const start = Math.max(0, size - maxInitialBytes);
        const length = size - start;
        const buffer = Buffer.alloc(length);

        if (length > 0) {
            const file = await fs.promises.open(this.logPath, "r");
            try {
                await file.read(buffer, 0, length, start);
            } finally {
                await file.close();
            }
        }

        this.position = size;
        this.fileIdentity = identity;
        this.decoder = new StringDecoder("utf8");

        const parts = buffer.toString("utf8").split(/\r?\n/);
        this.partialLine = parts.pop() ?? "";
        if (start > 0) {
            parts.shift();
        }

        void this.panel?.webview.postMessage({
            command: "reset",
            lines: parts.slice(-maxLines)
        });
        this.setStatus(`Following ${this.logPath}`);
    }

    private async readAppendedBytes(end: number): Promise<void> {
        const file = await fs.promises.open(this.logPath, "r");
        const lines: string[] = [];

        try {
            while (this.position < end) {
                const length = Math.min(readChunkBytes, end - this.position);
                const buffer = Buffer.allocUnsafe(length);
                const result = await file.read(buffer, 0, length, this.position);

                if (result.bytesRead === 0) {
                    break;
                }

                this.position += result.bytesRead;
                const text = this.partialLine + this.decoder.write(buffer.subarray(0, result.bytesRead));
                const parts = text.split(/\r?\n/);
                this.partialLine = parts.pop() ?? "";
                lines.push(...parts);
            }
        } finally {
            await file.close();
        }

        if (lines.length > 0) {
            void this.panel?.webview.postMessage({ command: "append", lines });
        }
    }

    private setStatus(text: string, error = false): void {
        const status = `${error}:${text}`;
        if (status === this.lastStatus) {
            return;
        }

        this.lastStatus = status;
        void this.panel?.webview.postMessage({ command: "status", text, error });
    }

    private getHtml(webview: vscode.Webview): string {
        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <style>
                :root { color-scheme: light dark; }
                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    padding-top: 108px;
                    color: var(--vscode-editor-foreground);
                    background: var(--vscode-editor-background);
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                }
                header {
                    position: fixed;
                    inset: 0 0 auto 0;
                    z-index: 1;
                    padding: 8px 12px 6px;
                    background: var(--vscode-editor-background);
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                .toolbar { display: flex; gap: 6px; align-items: center; }
                .filters {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px 12px;
                    align-items: center;
                    margin-top: 6px;
                    font-family: var(--vscode-font-family);
                    font-size: 11px;
                }
                .filter-group { display: flex; gap: 2px; align-items: center; }
                .filter-label {
                    margin-right: 3px;
                    color: var(--vscode-descriptionForeground);
                }
                #filter {
                    min-width: 180px;
                    flex: 1;
                    height: 28px;
                    padding: 3px 8px;
                    color: var(--vscode-input-foreground);
                    background: var(--vscode-input-background);
                    border: 1px solid var(--vscode-input-border, transparent);
                    outline: none;
                }
                #filter:focus { border-color: var(--vscode-focusBorder); }
                #filter:invalid { border-color: var(--vscode-inputValidation-errorBorder); }
                button {
                    height: 28px;
                    min-width: 34px;
                    padding: 2px 8px;
                    color: var(--vscode-button-secondaryForeground);
                    background: var(--vscode-button-secondaryBackground);
                    border: 1px solid transparent;
                    cursor: pointer;
                }
                button:hover { background: var(--vscode-button-secondaryHoverBackground); }
                button.active {
                    color: var(--vscode-button-foreground);
                    background: var(--vscode-button-background);
                    border-color: var(--vscode-focusBorder);
                }
                .filters button { height: 24px; min-width: 0; padding: 1px 7px; }
                #configureIgnored { padding-inline: 6px; }
                #meta {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    margin-top: 5px;
                    color: var(--vscode-descriptionForeground);
                    font-family: var(--vscode-font-family);
                    font-size: 11px;
                    white-space: nowrap;
                }
                #state { overflow: hidden; text-overflow: ellipsis; }
                #state.error { color: var(--vscode-errorForeground); }
                #log { padding: 3px 12px 18px; }
                .line { min-height: 1.4em; white-space: pre-wrap; overflow-wrap: anywhere; }
                .entry.warning { color: var(--vscode-editorWarning-foreground); }
                .entry.error { color: var(--vscode-editorError-foreground); }
                #empty {
                    display: none;
                    padding: 24px 12px;
                    color: var(--vscode-descriptionForeground);
                    font-family: var(--vscode-font-family);
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <header>
                <div class="toolbar">
                    <input id="filter" type="text" placeholder="Filter log lines..." spellcheck="false" aria-label="Filter log lines">
                    <button id="regex" title="Use regular expression" aria-pressed="false">.*</button>
                    <button id="case" title="Match case" aria-pressed="false">Aa</button>
                </div>
                <div class="filters">
                    <div class="filter-group" id="severity" aria-label="Minimum severity">
                        <span class="filter-label">Level</span>
                        <button class="active" data-level="all">All</button>
                        <button data-level="info">Info+</button>
                        <button data-level="warning">Warnings+</button>
                        <button data-level="error">Errors</button>
                    </div>
                    <div class="filter-group">
                        <button id="scripting" title="Show only entries from scripting sources" aria-pressed="false">SCRIPTING</button>
                        <button id="hideIgnored" class="active" title="Hide entries matching configured patterns" aria-pressed="true">Hide ignored</button>
                        <button id="configureIgnored" title="Configure ignored log patterns" aria-label="Configure ignored log patterns">&#9881;</button>
                    </div>
                </div>
                <div id="meta">
                    <span id="state">Opening DCS log...</span>
                    <span id="count">0 lines</span>
                </div>
            </header>
            <main id="log"></main>
            <div id="empty">No log lines match the current filter.</div>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                const maxLines = ${maxLines};
                const filterInput = document.getElementById("filter");
                const regexButton = document.getElementById("regex");
                const caseButton = document.getElementById("case");
                const severity = document.getElementById("severity");
                const scriptingButton = document.getElementById("scripting");
                const hideIgnoredButton = document.getElementById("hideIgnored");
                const configureIgnoredButton = document.getElementById("configureIgnored");
                const state = document.getElementById("state");
                const count = document.getElementById("count");
                const log = document.getElementById("log");
                const empty = document.getElementById("empty");
                let lines = [];
                let useRegex = false;
                let matchCase = false;
                let minimumLevel = "all";
                let scriptingOnly = false;
                let hideIgnored = true;
                let excludedPatterns = [];
                let renderTimer;

                const headerPattern = /^\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}:\\d{2}\\.\\d+\\s+(TRACE|DEBUG|INFO|WARNING|ERROR(?:_ONCE)?|ALERT|CRITICAL|FATAL)\\s+(.+?)\\s+\\(([^)]*)\\):/i;

                function parseEntries() {
                    const entries = [];
                    let current;

                    for (const line of lines) {
                        const header = line.match(headerPattern);
                        if (header) {
                            current = {
                                lines: [line],
                                level: normalizeLevel(header[1]),
                                source: header[2],
                                text: line
                            };
                            entries.push(current);
                        } else if (current) {
                            current.lines.push(line);
                            current.text += "\\n" + line;
                        } else {
                            current = { lines: [line], level: "info", source: "", text: line };
                            entries.push(current);
                        }
                    }

                    return entries;
                }

                function normalizeLevel(level) {
                    const normalized = level.toLocaleLowerCase();
                    if (normalized.startsWith("error") || normalized === "alert" ||
                        normalized === "critical" || normalized === "fatal") return "error";
                    if (normalized === "warning") return "warning";
                    if (normalized === "info") return "info";
                    return "debug";
                }

                function levelRank(level) {
                    return { debug: 0, info: 1, warning: 2, error: 3 }[level] ?? 0;
                }

                function matcher() {
                    const query = filterInput.value;
                    if (!query) return () => true;

                    if (useRegex) {
                        try {
                            const expression = new RegExp(query, matchCase ? "" : "i");
                            filterInput.setCustomValidity("");
                            return text => expression.test(text);
                        } catch (error) {
                            filterInput.setCustomValidity(String(error));
                            return () => false;
                        }
                    }

                    filterInput.setCustomValidity("");
                    const needle = matchCase ? query : query.toLocaleLowerCase();
                    return text => (matchCase ? text : text.toLocaleLowerCase()).includes(needle);
                }

                function ignoredMatchers() {
                    return excludedPatterns.flatMap(pattern => {
                        try {
                            return [new RegExp(pattern, "i")];
                        } catch {
                            return [];
                        }
                    });
                }

                function makeEntry(entry) {
                    const element = document.createElement("div");
                    element.className = "entry " + entry.level;
                    for (const text of entry.lines) {
                        const line = document.createElement("div");
                        line.className = "line";
                        line.textContent = text || " ";
                        element.appendChild(line);
                    }
                    return element;
                }

                function render() {
                    const matches = matcher();
                    const entries = parseEntries();
                    const exclusions = ignoredMatchers();
                    const fragment = document.createDocumentFragment();
                    const minimumRank = minimumLevel === "all" ? 0 : levelRank(minimumLevel);
                    let visibleLines = 0;
                    let ignored = 0;

                    for (const entry of entries) {
                        const isIgnored = exclusions.some(expression => expression.test(entry.text));
                        if (isIgnored) ignored++;
                        if (levelRank(entry.level) < minimumRank ||
                            (scriptingOnly && !entry.source.toLocaleLowerCase().includes("scripting")) ||
                            (hideIgnored && isIgnored) || !matches(entry.text)) continue;

                        fragment.appendChild(makeEntry(entry));
                        visibleLines += entry.lines.length;
                    }

                    log.replaceChildren(fragment);
                    empty.style.display = lines.length > 0 && visibleLines === 0 ? "block" : "none";
                    count.textContent = visibleLines + " / " + lines.length + " lines";
                    hideIgnoredButton.textContent = "Hide ignored" + (ignored ? " (" + ignored + ")" : "");
                    requestAnimationFrame(() => window.scrollTo(0, document.body.scrollHeight));
                }

                function scheduleRender() {
                    clearTimeout(renderTimer);
                    renderTimer = setTimeout(render, 100);
                }

                filterInput.addEventListener("input", scheduleRender);
                regexButton.addEventListener("click", () => {
                    useRegex = !useRegex;
                    regexButton.classList.toggle("active", useRegex);
                    regexButton.setAttribute("aria-pressed", String(useRegex));
                    render();
                });
                caseButton.addEventListener("click", () => {
                    matchCase = !matchCase;
                    caseButton.classList.toggle("active", matchCase);
                    caseButton.setAttribute("aria-pressed", String(matchCase));
                    render();
                });
                severity.addEventListener("click", event => {
                    const button = event.target.closest("button[data-level]");
                    if (!button) return;
                    minimumLevel = button.dataset.level;
                    for (const option of severity.querySelectorAll("button")) {
                        option.classList.toggle("active", option === button);
                    }
                    render();
                });
                scriptingButton.addEventListener("click", () => {
                    scriptingOnly = !scriptingOnly;
                    scriptingButton.classList.toggle("active", scriptingOnly);
                    scriptingButton.setAttribute("aria-pressed", String(scriptingOnly));
                    render();
                });
                hideIgnoredButton.addEventListener("click", () => {
                    hideIgnored = !hideIgnored;
                    hideIgnoredButton.classList.toggle("active", hideIgnored);
                    hideIgnoredButton.setAttribute("aria-pressed", String(hideIgnored));
                    render();
                });
                configureIgnoredButton.addEventListener("click", () => {
                    vscode.postMessage({ command: "configureExclusions" });
                });
                document.addEventListener("keydown", event => {
                    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "f") {
                        event.preventDefault();
                        filterInput.focus();
                        filterInput.select();
                    }
                });
                window.addEventListener("message", event => {
                    const message = event.data;
                    if (message.command === "reset") {
                        lines = message.lines.slice(-maxLines);
                        render();
                    } else if (message.command === "append") {
                        lines.push(...message.lines);
                        if (lines.length > maxLines) lines.splice(0, lines.length - maxLines);
                        render();
                    } else if (message.command === "status") {
                        state.textContent = message.text;
                        state.classList.toggle("error", Boolean(message.error));
                    } else if (message.command === "configuration") {
                        excludedPatterns = message.excludedPatterns;
                        render();
                    }
                });
                vscode.postMessage({ command: "ready" });
            </script>
        </body>
        </html>`;
    }
}

function getNonce(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = "";
    for (let i = 0; i < 32; i++) {
        nonce += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return nonce;
}
