import mysql from "mysql2/promise";
import "dotenv/config";

const dbConfig = {
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: 10,
};

export const pool = mysql.createPool(dbConfig);

export async function queryDatabase(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export async function initializeDatabase() {
  try {
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS stories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        domain VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database initialized");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

export async function storeNews(newsItems) {
    if (newsItems.length === 0) return;
  
    const placeholders = newsItems.map(() => "(?, ?, ?)").join(", ");
    const values = newsItems.flatMap((item) => [item.title, item.url, item.domain]);
  
    const query = `
      INSERT INTO stories (title, url, domain) VALUES ${placeholders}
    `;
  
    await queryDatabase(query, values);
  }
  
export async function getRecentStoriesCount() {
  const query = `
    SELECT COUNT(*) as count 
    FROM stories 
    WHERE created_at >= NOW() - INTERVAL 5 MINUTE
  `;
  const result = await queryDatabase(query);
  return result[0].count;
}
