import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chs_acquittals',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

export async function connectDatabase(): Promise<void> {
  try {
    // Test the connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    logger.info('Successfully connected to MySQL database');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

// Helper function to execute queries
export async function executeQuery(sql: string, params: any[] = []): Promise<any> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
}

// Helper function to execute transactions
export async function executeTransaction(queries: { sql: string; params?: any[] }[]): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    for (const query of queries) {
      await connection.execute(query.sql, query.params || []);
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
} 