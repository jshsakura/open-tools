import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// 데이터베이스 파일 경로 설정
const DB_PATH = path.join(process.cwd(), "visitors.db");

// DB 연결 (파일이 없으면 자동 생성)
const db = new Database(DB_PATH);

// 테이블 초기화
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

export function getVisitorStats() {
  const today = new Date().toISOString().split("T")[0];
  
  const totalRow = db.prepare("SELECT count FROM totals WHERE id = 'total_visits'").get() as { count: number };
  const dailyRow = db.prepare("SELECT count FROM daily WHERE date = ?").get(today) as { count: number } | undefined;
  
  return {
    total: totalRow?.count || 0,
    today: dailyRow?.count || 0
  };
}

export function incrementVisitorCount() {
  const today = new Date().toISOString().split("T")[0];
  
  // 트랜잭션으로 처리
  const update = db.transaction(() => {
    // 전체 카운트 증가
    db.prepare("UPDATE totals SET count = count + 1 WHERE id = 'total_visits'").run();
    
    // 당일 카운트 증가 (없으면 생성)
    db.prepare(`
      INSERT INTO daily (date, count) 
      VALUES (?, 1) 
      ON CONFLICT(date) DO UPDATE SET count = count + 1
    `).run(today);
  });
  
  update();
  return getVisitorStats();
}
