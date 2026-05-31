const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = __dirname;
loadEnv();

const PORT = Number(process.env.PORT) || 3000;
const FINNHUB_URL = 'https://finnhub.io/api/v1/news?category=general';
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_ARTICLES = 20;

const cache = {
  general: {
    expiresAt: 0,
    data: [],
  },
};

const categoryKeywords = {
  all: [],
  markets: ['market', 'nifty', 'sensex', 'nasdaq', 'dow', 'index', 'indices', 'yield', 'bond'],
  stocks: ['stock', 'shares', 'equity', 'earnings', 'ipo', 'dividend', 'analyst', 'company'],
  'mutual-funds': ['mutual fund', 'etf', 'fund', 'sip', 'nav', 'asset management', 'amc'],
  economy: ['economy', 'inflation', 'gdp', 'rbi', 'fed', 'rate', 'policy', 'jobs', 'recession'],
  crypto: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'token', 'coin', 'web3'],
  'personal-finance': ['personal finance', 'budget', 'saving', 'credit card', 'loan', 'tax', 'insurance'],
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    value = value.replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, {
    error: {
      message,
      statusCode,
    },
  });
}

function normalizeArticle(article) {
  const publishedMs = Number(article.datetime || 0) * 1000;
  const title = cleanText(article.headline || article.title || '');
  const url = typeof article.url === 'string' ? article.url : '';

  return {
    id: createArticleId(url || title),
    title,
    description: cleanText(article.summary || article.description || ''),
    source: cleanText(article.source || 'Finnhub'),
    url,
    image: typeof article.image === 'string' ? article.image : '',
    publishedAt: Number.isFinite(publishedMs) && publishedMs > 0
      ? new Date(publishedMs).toISOString()
      : new Date().toISOString(),
    datetime: Number(article.datetime || Math.floor(Date.now() / 1000)),
  };
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function createArticleId(value) {
  let hash = 0;
  const input = String(value || `${Date.now()}-${Math.random()}`);
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return `news-${Math.abs(hash)}`;
}

function removeDuplicates(articles) {
  const seen = new Set();
  const unique = [];

  for (const article of articles) {
    const key = (article.url || article.title).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(article);
  }

  return unique;
}

function matchesCategory(article, category) {
  if (!category || category === 'all') return true;
  const keywords = categoryKeywords[category] || [];
  if (keywords.length === 0) return true;

  const haystack = `${article.title} ${article.description} ${article.source}`.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword));
}

function matchesSearch(article, query) {
  if (!query) return true;
  const haystack = `${article.title} ${article.description} ${article.source}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

async function fetchFinnhubNews() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    const error = new Error('FINNHUB_API_KEY is missing. Add it to .env and restart the server.');
    error.statusCode = 500;
    throw error;
  }

  if (cache.general.data.length && Date.now() < cache.general.expiresAt) {
    return cache.general.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${FINNHUB_URL}&token=${encodeURIComponent(apiKey)}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinWise/1.0',
      },
    });

    if (!response.ok) {
      const error = new Error(`Finnhub request failed with status ${response.status}`);
      error.statusCode = response.status >= 500 ? 502 : response.status;
      throw error;
    }

    const payload = await response.json();
    const normalized = removeDuplicates(
      (Array.isArray(payload) ? payload : [])
        .map(normalizeArticle)
        .filter((article) => article.title && article.url)
        .sort((a, b) => b.datetime - a.datetime)
    );

    cache.general = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: normalized,
    };

    return normalized;
  } finally {
    clearTimeout(timeout);
  }
}

async function handleNewsRequest(req, res, parsedUrl) {
  try {
    const category = (parsedUrl.searchParams.get('category') || 'all').toLowerCase();
    const search = (parsedUrl.searchParams.get('search') || '').trim();
    const allowedCategory = Object.hasOwn(categoryKeywords, category) ? category : 'all';
    const articles = await fetchFinnhubNews();

    const filtered = articles
      .filter((article) => matchesCategory(article, allowedCategory))
      .filter((article) => matchesSearch(article, search))
      .slice(0, MAX_ARTICLES);

    sendJson(res, 200, {
      data: filtered,
      meta: {
        category: allowedCategory,
        search,
        count: filtered.length,
        cachedUntil: new Date(cache.general.expiresAt).toISOString(),
        refreshedAt: new Date().toISOString(),
      },
    }, {
      'Cache-Control': 'private, max-age=60',
    });
  } catch (error) {
    const statusCode = error.statusCode || (error.name === 'AbortError' ? 504 : 500);
    const message = error.name === 'AbortError' ? 'Finnhub request timed out.' : error.message;
    sendError(res, statusCode, message);
  }
}

function serveStatic(req, res, parsedUrl) {
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.normalize(path.join(ROOT, safePath));

  if (!filePath.startsWith(ROOT)) {
    sendError(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendError(res, error.code === 'ENOENT' ? 404 : 500, error.code === 'ENOENT' ? 'Not found' : 'Unable to read file');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && parsedUrl.pathname === '/api/news') {
    handleNewsRequest(req, res, parsedUrl);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendError(res, 405, 'Method not allowed');
    return;
  }

  serveStatic(req, res, parsedUrl);
});

server.listen(PORT, () => {
  console.log(`FinWise server running at http://localhost:${PORT}`);
});
