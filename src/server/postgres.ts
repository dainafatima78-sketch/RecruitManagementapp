import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

let pool: Pool | null = null;

export function getPostgresPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString || connectionString.trim() === '' || connectionString.includes('YOUR_POSTGRES_URL')) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' || connectionString.includes('sslmode=require') || connectionString.includes('render.com') || connectionString.includes('neon.tech') || connectionString.includes('supabase')
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }

  return pool;
}

/**
 * Initializes PostgreSQL tables matching RecruitAI schema
 */
export async function initializePostgresDatabase(): Promise<boolean> {
  const p = getPostgresPool();
  if (!p) {
    return false;
  }

  try {
    const client = await p.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          salt VARCHAR(255) NOT NULL,
          role VARCHAR(100) NOT NULL DEFAULT 'Technical Recruiter',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sessions (
          token VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL
        );

        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          location VARCHAR(100) NOT NULL,
          employment_type VARCHAR(50) NOT NULL,
          applicants_count INT DEFAULT 0,
          status VARCHAR(50) NOT NULL DEFAULT 'Open',
          created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          description TEXT NOT NULL,
          required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
          preferred_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
          min_experience VARCHAR(50) NOT NULL,
          education_requirements VARCHAR(255) NOT NULL,
          responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb
        );

        CREATE TABLE IF NOT EXISTS candidates (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          location VARCHAR(100),
          current_role VARCHAR(100) NOT NULL,
          key_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
          experience_years INT NOT NULL DEFAULT 0,
          education VARCHAR(255) NOT NULL,
          education_details JSONB DEFAULT '[]'::jsonb,
          work_history JSONB DEFAULT '[]'::jsonb,
          certifications JSONB DEFAULT '[]'::jsonb,
          associated_job_id VARCHAR(64),
          associated_job_title VARCHAR(255),
          match_score INT DEFAULT 0,
          date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          status VARCHAR(50) NOT NULL DEFAULT 'New',
          summary TEXT,
          resume_file_name VARCHAR(255),
          resume_file_size VARCHAR(50),
          resume_text_content TEXT
        );

        CREATE TABLE IF NOT EXISTS matches (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          candidate_id VARCHAR(64) NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
          job_id VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
          candidate_name VARCHAR(255) NOT NULL,
          job_title VARCHAR(255) NOT NULL,
          overall_score INT NOT NULL,
          skills_score INT NOT NULL,
          experience_score INT NOT NULL,
          education_score INT NOT NULL,
          matching_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
          missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
          strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
          experience_comparison JSONB NOT NULL,
          education_comparison JSONB NOT NULL,
          missing_info_notes JSONB DEFAULT '[]'::jsonb,
          suggested_questions JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS interviews (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          number INT NOT NULL,
          role VARCHAR(255) NOT NULL,
          related_job_id VARCHAR(64),
          text TEXT NOT NULL,
          category VARCHAR(100) NOT NULL,
          difficulty VARCHAR(50) NOT NULL,
          evaluation_criteria TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS activities (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(100) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          username VARCHAR(255) NOT NULL
        );
      `);

      console.log('✓ PostgreSQL tables initialized and ready.');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('PostgreSQL connection/init note:', (err as any).message);
    return false;
  }
}

