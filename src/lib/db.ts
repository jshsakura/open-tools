import fs from "fs";
import path from "path";

type VisitorStats = {
  total: number;
  today: number;
};

type VisitorStore = {
  total: number;
  daily: Record<string, number>;
};

type StatementResult = {
  get(param?: string): { count: number } | undefined;
  run(param?: string): void;
};

type SqliteDatabase = {
  exec(sql: string): void;
  prepare(sql: string): StatementResult;
  transaction<T extends () => void>(fn: T): T;
};

type BetterSqlite3Factory = {
  new (filename: string): SqliteDatabase;
  default?: new (filename: string) => SqliteDatabase;
};

type VisitorBackend = {
  getVisitorStats(): VisitorStats;
  incrementVisitorCount(): VisitorStats;
};

const DB_PATH = process.env.DATABASE_PATH?.trim() || path.join(process.cwd(), "database.db");
const DB_DIR = path.dirname(DB_PATH);
const VISITOR_STORE_PATH = process.env.VISITOR_STORE_PATH?.trim() || path.join(DB_DIR, "visitor-stats.json");

let backend: VisitorBackend | null = null;
let warnedAboutFallback = false;

function ensureStorageDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function readFileStore(): VisitorStore {
  ensureStorageDir();

  if (!fs.existsSync(VISITOR_STORE_PATH)) {
    return { total: 0, daily: {} };
  }

  try {
    const raw = fs.readFileSync(VISITOR_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<VisitorStore>;

    return {
      total: typeof parsed.total === "number" ? parsed.total : 0,
      daily: typeof parsed.daily === "object" && parsed.daily !== null ? parsed.daily : {},
    };
  } catch {
    return { total: 0, daily: {} };
  }
}

function writeFileStore(store: VisitorStore) {
  ensureStorageDir();
  fs.writeFileSync(VISITOR_STORE_PATH, JSON.stringify(store), "utf8");
}

function createFileBackend(): VisitorBackend {
  return {
    getVisitorStats() {
      const today = getToday();
      const store = readFileStore();

      return {
        total: store.total,
        today: store.daily[today] ?? 0,
      };
    },

    incrementVisitorCount() {
      const today = getToday();
      const store = readFileStore();
      const nextStore: VisitorStore = {
        total: store.total + 1,
        daily: {
          ...store.daily,
          [today]: (store.daily[today] ?? 0) + 1,
        },
      };

      writeFileStore(nextStore);

      return {
        total: nextStore.total,
        today: nextStore.daily[today],
      };
    },
  };
}

function createSqliteBackend(): VisitorBackend {
  ensureStorageDir();

  const sqliteModule = require("better-sqlite3") as BetterSqlite3Factory;
  const Database = sqliteModule.default ?? sqliteModule;
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS totals (
      id TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS daily (
      date TEXT PRIMARY KEY,
      count INTEGER DEFAULT 0
    );

    INSERT OR IGNORE INTO totals (id, count) VALUES ('total_visits', 0);
  `);

  const getStats = (): VisitorStats => {
    const today = getToday();
    const totalRow = db.prepare("SELECT count FROM totals WHERE id = 'total_visits'").get();
    const dailyRow = db.prepare("SELECT count FROM daily WHERE date = ?").get(today);

    return {
      total: totalRow?.count ?? 0,
      today: dailyRow?.count ?? 0,
    };
  };

  const increment = db.transaction(() => {
    const today = getToday();
    db.prepare("UPDATE totals SET count = count + 1 WHERE id = 'total_visits'").run();
    db.prepare(`
      INSERT INTO daily (date, count)
      VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET count = count + 1
    `).run(today);
  });

  return {
    getVisitorStats: getStats,
    incrementVisitorCount() {
      increment();
      return getStats();
    },
  };
}

function getBackend() {
  if (backend) {
    return backend;
  }

  try {
    backend = createSqliteBackend();
  } catch (error) {
    if (!warnedAboutFallback) {
      warnedAboutFallback = true;
      console.warn("better-sqlite3 unavailable, using file-backed visitor store", error);
    }

    backend = createFileBackend();
  }

  return backend;
}

export function getVisitorStats() {
  return getBackend().getVisitorStats();
}

export function incrementVisitorCount() {
  return getBackend().incrementVisitorCount();
}
