import { defineConfig, loadEnv } from "vite";
import { createAltchaChallenge } from "./api/altcha-core.js";

const API_ENV_KEYS = [
  "ALTCHA_HMAC_KEY",
  "SKIP_ALTCHA_LOCALHOST",
  "SKIP_RECAPTCHA_LOCALHOST",
  "EMAIL_USER",
  "EMAIL_PASS",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "REFRESH_TOKEN",
  "REDIRECT_URI",
];

function applyApiEnv(mode) {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of API_ENV_KEYS) {
    if (env[key] && !process.env[key]) {
      process.env[key] = env[key];
    }
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function vercelLikeResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(data) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
      return this;
    },
  };
}

async function apiDevMiddleware(req, res, next) {
  const url = req.url?.split("?")[0];

  if (url === "/api/altcha") {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.end();
      return;
    }

    try {
      const challenge = await createAltchaChallenge();
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify(challenge));
    } catch (error) {
      console.error("ALTCHA challenge error:", error);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "ALTCHA challenge failed" }));
    }
    return;
  }

  if (url === "/api/send") {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end();
      return;
    }

    try {
      req.body = await readJsonBody(req);
      const sendSpecifier = `${process.cwd()}/api/send.js`;
      const { default: handler } = await import(sendSpecifier);
      await handler(req, vercelLikeResponse(res));
    } catch (error) {
      console.error("Send API error:", error);
      if (!res.writableEnded) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Submit error." }));
      }
    }
    return;
  }

  next();
}

function apiDevPlugin() {
  return {
    name: "api-dev-endpoints",
    config(_, { mode }) {
      applyApiEnv(mode);
    },
    configureServer(server) {
      server.middlewares.use(apiDevMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiDevMiddleware);
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: command === "serve" ? [apiDevPlugin()] : [],
}));
