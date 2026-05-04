/**
 * OpenClaw Telegram Bot
 *
 * Start: npx ts-node services/telegram-bot.ts
 * Env:   TELEGRAM_BOT_TOKEN  — from @BotFather
 *        OPENCLAW_URL        — defaults to http://localhost:3000
 */

import * as http from "http";
import * as https from "https";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const BASE_URL = process.env.OPENCLAW_URL ?? "http://localhost:3000";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

if (!BOT_TOKEN) {
  console.error("✗ TELEGRAM_BOT_TOKEN is not set");
  process.exit(1);
}

// ─── Telegram API helpers ────────────────────────────────────────────────────
function tgRequest(method: string, body: object): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(`${TELEGRAM_API}/${method}`);
    const options: https.RequestOptions = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error(raw));
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function sendMessage(chatId: number, text: string, parseMode?: "Markdown" | "HTML") {
  return tgRequest("sendMessage", {
    chat_id: chatId,
    text: text.slice(0, 4096),
    parse_mode: parseMode,
    disable_web_page_preview: true,
  });
}

// ─── OpenClaw API helpers ────────────────────────────────────────────────────
function postJSON(urlStr: string, body: object): Promise<{ taskId: string }> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const data = JSON.stringify(body);
    const lib = url.protocol === "https:" ? https : http;
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };
    const req = lib.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error(`Bad response: ${raw}`)); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function connectSSE(urlStr: string, onEvent: (event: string, data: string) => void, onEnd: () => void) {
  const url = new URL(urlStr);
  const lib = url.protocol === "https:" ? https : http;
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname,
    method: "GET",
    headers: { Accept: "text/event-stream" },
  };
  const req = lib.request(options, (res) => {
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

// ─── Task runner ─────────────────────────────────────────────────────────────
async function runTask(chatId: number, prompt: string) {
  await sendMessage(chatId, `🦾 *Miso is thinking…*\n\`${prompt.slice(0, 100)}\``, "Markdown");

  let taskId: string;
  try {
    const res = await postJSON(`${BASE_URL}/api/agents/run`, { prompt });
    taskId = res.taskId;
  } catch {
    await sendMessage(chatId, "✗ Could not reach OpenClaw server. Make sure it's running.");
    return;
  }

  // Collect per-team logs
  const teamLogs: Record<string, string[]> = {};
  let done = false;

  connectSSE(
    `${BASE_URL}/api/stream`,
    async (event, data) => {
      if (event === "ping") return;
      try {
        const payload = JSON.parse(data);

        if (event === "team_start") {
          teamLogs[payload.team] = [];
        } else if (event === "agent_log") {
          const team = payload.team ?? "?";
          if (!teamLogs[team]) teamLogs[team] = [];
          if (payload.content) teamLogs[team].push(payload.content.slice(0, 200));
        } else if (event === "task_complete" && payload.taskId === taskId) {
          done = true;
          const result = (payload.result ?? "").slice(0, 3500);
          await sendMessage(chatId, `✅ *Done!*\n\n${result}`, "Markdown");
        } else if (event === "task_failed" && payload.taskId === taskId) {
          done = true;
          await sendMessage(chatId, `✗ Task failed: ${payload.error ?? "unknown"}`);
        }
      } catch { /* ignore */ }
    },
    async () => {
      if (!done) {
        await sendMessage(chatId, "⚠️ Stream closed before task completed. Check the dashboard.");
      }
    }
  );
}

// ─── Long-polling loop ────────────────────────────────────────────────────────
let lastUpdateId = 0;

async function poll() {
  while (true) {
    try {
      const res = (await tgRequest("getUpdates", {
        offset: lastUpdateId + 1,
        timeout: 30,
        allowed_updates: ["message"],
      })) as { ok: boolean; result: Array<{ update_id: number; message?: { chat: { id: number }; text?: string; from?: { first_name: string } } }> };

      if (res.ok && res.result.length) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          const msg = update.message;
          if (!msg || !msg.text) continue;

          const chatId = msg.chat.id;
          const text = msg.text.trim();
          const name = msg.from?.first_name ?? "User";

          if (text === "/start" || text === "/help") {
            await sendMessage(
              chatId,
              `👋 Hi ${name}! I'm *OpenClaw Bot*.\n\nSend me any task and Miso will orchestrate the agents for you.\n\nExample:\n_Design a landing page for a coffee shop_`,
              "Markdown"
            );
            continue;
          }

          if (text === "/status") {
            await sendMessage(chatId, `🟢 OpenClaw server: ${BASE_URL}`);
            continue;
          }

          if (text.startsWith("/")) continue; // ignore unknown commands

          console.log(`[${new Date().toISOString()}] @${name} (${chatId}): ${text.slice(0, 80)}`);
          runTask(chatId, text).catch(console.error);
        }
      }
    } catch (err) {
      console.error("Poll error:", err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

console.log(`🤖 OpenClaw Telegram Bot starting…`);
console.log(`   Server: ${BASE_URL}`);
poll().catch(console.error);
