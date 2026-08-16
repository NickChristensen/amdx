import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  createMessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
} from "vscode-jsonrpc/node.js";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const diagnosticDelayMilliseconds = 500;
const requestTimeoutMilliseconds = 15_000;

type LspDiagnostic = {
  message: string;
  range: {
    start: {
      line: number;
      character: number;
    };
  };
  source?: string;
};

type DiagnosticWaiter = {
  resolve: (diagnostics: LspDiagnostic[]) => void;
  timer?: NodeJS.Timeout;
};

function withTimeout<T>(promise: Promise<T>, label: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out.`));
    }, requestTimeoutMilliseconds);

    promise.then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export class MdxAnalyzer {
  private readonly server: ChildProcessWithoutNullStreams;
  private readonly connection;
  private readonly diagnosticWaiters = new Map<string, DiagnosticWaiter>();
  private initialized = false;
  private version = 0;
  private stderr = "";

  constructor() {
    const serverPath = path.join(
      projectRoot,
      "node_modules",
      "@mdx-js",
      "language-server",
      "lib",
      "index.js",
    );

    this.server = spawn(process.execPath, [serverPath, "--stdio"], {
      cwd: projectRoot,
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.server.stderr.setEncoding("utf8");
    this.server.stderr.on("data", (chunk: string) => {
      this.stderr += chunk;
    });

    const logger = {
      error: () => undefined,
      warn: () => undefined,
      info: () => undefined,
      log: () => undefined,
    };
    this.connection = createMessageConnection(
      new StreamMessageReader(this.server.stdout),
      new StreamMessageWriter(this.server.stdin),
      logger,
    );
    this.connection.onNotification(
      "textDocument/publishDiagnostics",
      ({ uri, diagnostics }: { uri: string; diagnostics: LspDiagnostic[] }) => {
        const waiter = this.diagnosticWaiters.get(uri);
        if (!waiter) {
          return;
        }

        clearTimeout(waiter.timer);
        waiter.timer = setTimeout(() => {
          waiter.resolve(diagnostics);
          this.diagnosticWaiters.delete(uri);
        }, diagnosticDelayMilliseconds);
      },
    );
    this.connection.onRequest("client/registerCapability", () => null);
    this.connection.onRequest("workspace/configuration", () => []);
    this.connection.onRequest("workspace/workspaceFolders", () => [
      {
        name: "amdx",
        uri: pathToFileURL(projectRoot).href,
      },
    ]);
    this.connection.listen();
  }

  async diagnose(filePath: string, text: string) {
    await this.initialize();
    const uri = pathToFileURL(filePath).href;
    const diagnostics = new Promise<LspDiagnostic[]>((resolve) => {
      this.diagnosticWaiters.set(uri, { resolve });
    });

    this.version += 1;
    this.connection.sendNotification("textDocument/didOpen", {
      textDocument: {
        uri,
        languageId: "mdx",
        version: this.version,
        text,
      },
    });

    try {
      return await withTimeout(
        diagnostics,
        `MDX Analyzer diagnostics for ${filePath}${this.stderr ? `: ${this.stderr}` : ""}`,
      );
    } finally {
      this.connection.sendNotification("textDocument/didClose", {
        textDocument: { uri },
      });
    }
  }

  async close() {
    try {
      if (this.initialized) {
        await this.connection.sendRequest("shutdown");
        this.connection.sendNotification("exit");
      }
    } finally {
      for (const waiter of this.diagnosticWaiters.values()) {
        clearTimeout(waiter.timer);
      }
      this.diagnosticWaiters.clear();
      this.connection.dispose();
      this.server.kill();
    }
  }

  private async initialize() {
    if (this.initialized) {
      return;
    }

    const result = await withTimeout(
      this.connection.sendRequest("initialize", {
        processId: process.pid,
        rootUri: pathToFileURL(projectRoot).href,
        capabilities: {
          workspace: {
            configuration: true,
            workspaceFolders: true,
          },
        },
        initializationOptions: {
          typescript: {
            enabled: true,
            tsdk: path.join(projectRoot, "node_modules", "typescript", "lib"),
          },
        },
        workspaceFolders: [
          {
            name: "amdx",
            uri: pathToFileURL(projectRoot).href,
          },
        ],
      }),
      "MDX Analyzer initialization",
    ) as { capabilities: { textDocumentSync?: unknown } };

    if (!result.capabilities.textDocumentSync) {
      throw new Error("MDX Analyzer did not enable text document synchronization.");
    }

    this.connection.sendNotification("initialized", {});
    this.initialized = true;
  }
}
