const DEFAULT_CV_ORIGIN = "https://cv.amal-yuldashev.com";
const DEFAULT_CV_FILENAME_PREFIX = "amal_yuldashev_software_engineer";

function cvOrigin() {
  return (process.env.CV_BASE_URL || DEFAULT_CV_ORIGIN).replace(/\/$/, "");
}

function cvFilenamePrefix() {
  const raw = (process.env.CV_FILENAME_PREFIX || DEFAULT_CV_FILENAME_PREFIX).trim();
  const stem = raw.replace(/\.pdf$/i, "").replace(/\/+$/, "").split("/").pop();
  return stem || DEFAULT_CV_FILENAME_PREFIX;
}
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MEMORY_TTL_MS = 6 * 60 * 60 * 1000;

const hitsByIp = new Map();
const pdfCache = new Map();

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hitsByIp.get(ip);

  if (!entry || now >= entry.resetAt) {
    hitsByIp.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

function pruneMaps(now) {
  if (hitsByIp.size > 2000) {
    for (const [ip, entry] of hitsByIp) {
      if (now >= entry.resetAt) hitsByIp.delete(ip);
    }
  }

  for (const [locale, entry] of pdfCache) {
    if (now >= entry.expiresAt) pdfCache.delete(locale);
  }
}

function localeFromRequest(req) {
  const url = new URL(req.url, "http://localhost");
  const lang = url.searchParams.get("lang") || req.query?.lang;
  return lang === "de" ? "de" : "en";
}

function sendPdf(res, file, isHead) {
  res.setHeader("Content-Type", file.contentType);
  res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader(
    "CDN-Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=3600"
  );
  res.setHeader(
    "Vercel-CDN-Cache-Control",
    "public, s-maxage=86400, stale-while-revalidate=3600"
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.statusCode = 200;

  if (isHead) {
    res.end();
    return;
  }

  res.end(file.buffer);
}

async function loadPdf(locale) {
  const now = Date.now();
  const cached = pdfCache.get(locale);
  if (cached && now < cached.expiresAt) {
    return cached;
  }

  const filename = `${cvFilenamePrefix()}_${locale}.pdf`;
  const source = `${cvOrigin()}/cv/${filename}`;
  const response = await fetch(source, {
    headers: { Accept: "application/pdf" },
  });

  if (!response.ok) {
    const error = new Error(`CV fetch failed: ${response.status}`);
    error.status = response.status === 404 ? 404 : 502;
    throw error;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const file = {
    buffer,
    contentType: response.headers.get("content-type") || "application/pdf",
    filename,
    expiresAt: now + MEMORY_TTL_MS,
  };

  pdfCache.set(locale, file);
  return file;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.setHeader("Cache-Control", "no-store");
    res.end();
    return;
  }

  const now = Date.now();
  pruneMaps(now);

  if (isRateLimited(clientIp(req))) {
    res.statusCode = 429;
    res.setHeader("Retry-After", "60");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Too many requests" }));
    return;
  }

  try {
    const file = await loadPdf(localeFromRequest(req));
    sendPdf(res, file, req.method === "HEAD");
  } catch (error) {
    console.error("CV proxy error:", error);
    res.statusCode = error.status || 502;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "CV is temporarily unavailable." }));
  }
}
