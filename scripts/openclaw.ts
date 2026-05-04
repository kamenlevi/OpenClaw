#!/usr/bin/env npx ts-node --esm
/**
 * OpenClaw CLI — submit tasks to Miso and stream the output live.
 *
 * Usage:
 *   npx ts-node scripts/openclaw.ts "your prompt here"
 *   npx ts-node scripts/openclaw.ts --list
 *   npx ts-node scripts/openclaw.ts --history
 */

import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as http from "http";

const BASE_URL = process.env.OPENCLAW_URL ?? "http://localhost:3000";
const WORKSPACE = path.join(os.homedir(), ".openclaw");

// ─── ANSI colours ────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

function c(color: keyof typeof C, text: string) {
  return `${C[color]}${text}${C.reset}`;
}

function banner() {
  console.log(c("cyan", "╔══════════════════════════════════════╗"));
  console.log(c("cyan", "║") + c("bold", "  🦾 OpenClaw CLI  ") + c("dim", "— powered by Miso  ") + c("cyan", "║"));
  console.log(c("cyan", "╚══════════════════════════════════════╝"));
  console.log();
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
async function postJSON(urlStr: string, body: object): Promise<{ taskId: string; status: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const data = JSON.stringify(body);
    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = http.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error(`Bad JSON from server: ${raw}`));
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function connectSSE(urlStr: string, onEvent: (event: string, data: string) => void, onEnd: () => void) {
  const url = new URL(urlStr);
  const options: http.RequestOptions = {
    hostname: url.hostname,
    port: url.port || 80,
    path: url.pathname,
    method: "GET",
    headers: { Accept: "text/event-stream" },
  };
  const req = http.request(options, (res) => {
    let buf = "";
    res.setEncoding("utf8");
    res.on("data", (chunk: string) => {
      buf += chunk;
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      let event = "message";
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) {
          onEvent(event, line.slice(5).trim());
          event = "message";
        }
      }
    });
    res.on("end", onEnd);
    res.on("error", onEnd);
  });
  req.on("error", onEnd);
  req.end();
  return req;
}

// ─── Commands ─────────────────────────────────────────────────────────────────
function cmdList() {
  const tasksDir = path.join(WORKSPACE, "tasks", "completed");
  if (!fs.existsSync(tasksDir)) {
    console.log(c("yellow", "No completed tasks yet."));
    return;
  }
  const files = fs.readdirSync(tasksDir).filter((f) => f.endsWith(".json")).sort().reverse().slice(0, 20);
  if (!files.length) {
    console.log(c("yellow", "No completed tasks yet."));
    return;
  }
  console.log(c("bold", "Recent tasks (latest 20):"));
  console.log();
  for (const f of files) {
    try {
      const t = JSON.parse(fs.readFileSync(path.join(tasksDir, f), "utf8"));
      const date = new Date(t.completedAt ?? t.createdAt).toLocaleString();
      const status = t.status === "completed" ? c("green", "✓") : c("red", "✗");
      console.log(`  ${status} ${c("gray", date)} ${c("cyan", t.id.slice(0, 8))} ${t.prompt.slice(0, 70)}`);
    } catch {
      /* skip corrupt */
    }
  }
}

function cmdHistory() {
  const memDir = path.join(WORKSPACE, "memory");
  if (!fs.existsSync(memDir)) {
    console.log(c("yellow", "No memory logs yet."));
    return;
  }
  const files = fs.readdirSync(memDir).filter((f) => f.endsWith(".md")).sort().reverse().slice(0, 5);
  for (const f of files) {
    console.log(c("bold", `\n── ${f} ──`));
    console.log(c("dim", fs.readFileSync(path.join(memDir, f), "utf8").slice(0, 2000)));
  }
}

async function cmdRun(prompt: string) {
  banner();

  console.log(c("magenta", "◆ MISO") + "  " + c("bold", prompt));
  console.log();

  // Submit task
  let taskId: string;
  try {
    const res = await postJSON(`${BASE_URL}/api/agents/run`, { prompt });
    taskId = res.taskId;
    console.log(c("gray", `Task ${taskId} started…`));
    console.log();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(c("red", `✗ Could not reach OpenClaw server at ${BASE_URL}`));
    console.error(c("dim", "  Make sure the server is running: npm run dev"));
    console.error(c("dim", `  Error: ${msg}`));
    process.exit(1);
  }

  // Stream SSE events
  let done = false;
  const req = connectSSE(
    `${BASE_URL}/api/stream`,
    (event, data) => {
      if (event === "ping") return;
      try {
        const payload = JSON.parse(data);

        if (event === "team_start") {
          console.log(c("blue", `▶ Team: ${payload.team}`));
        } else if (event === "agent_log") {
          const tag = `[${payload.agent ?? "?"}]`;
          console.log(`  ${c("yellow", tag)} ${payload.content ?? ""}`);
        } else if (event === "team_done") {
          console.log(c("green", `✓ ${payload.team} done`));
        } else if (event === "task_complete" && payload.taskId === taskId) {
          console.log();
          console.log(c("green", "═══════════════════════════════════"));
          console.log(c("bold", "Result:"));
          console.log();
          if (payload.result) console.log(payload.result);
          console.log();
          console.log(c("green", "═══════════════════════════════════"));
          done = true;
          req.destroy();
        } else if (event === "task_failed" && payload.taskId === taskId) {
          console.error(c("red", `✗ Task failed: ${payload.error ?? "unknown error"}`));
          done = true;
          req.destroy();
        }
      } catch {
        /* ignore non-JSON lines */
      }
    },
    () => {
      if (!done) {
        console.log(c("gray", "(stream closed)"));
      }
    }
  );

  // Keep process alive until task finishes
  await new Promise<void>((resolve) => {
    const check = setInterval(() => {
      if (done) {
        clearInterval(check);
        resolve();
      }
    }, 200);
  });
}

// ─── Interactive REPL ─────────────────────────────────────────────────────────
async function repl() {
  banner();
  console.log(c("dim", "Type your prompt and press Enter. Ctrl+C to exit."));
  console.log();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = () => {
    rl.question(c("cyan", "miso@openclaw:~$ "), async (input) => {
      const prompt = input.trim();
      if (!prompt) return ask();
      if (prompt === "exit" || prompt === "quit") {
        rl.close();
        return;
      }
      if (prompt === "--list") {
        cmdList();
        return ask();
      }
      if (prompt === "--history") {
        cmdHistory();
        return ask();
      }
      await cmdRun(prompt);
      ask();
    });
  };
  ask();
}

// ─── Entrypoint ───────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--list")) {
    banner();
    cmdList();
    return;
  }
  if (args.includes("--history")) {
    banner();
    cmdHistory();
    return;
  }

  const prompt = args.filter((a) => !a.startsWith("--")).join(" ").trim();
  if (prompt) {
    await cmdRun(prompt);
  } else {
    await repl();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
