-- Optional PostgreSQL migration target for HireFlow
CREATE TABLE users (id UUID PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE jobs (id UUID PRIMARY KEY, owner_id UUID REFERENCES users(id), title TEXT NOT NULL, department TEXT, location TEXT, type TEXT, description TEXT, status TEXT DEFAULT 'Open', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE candidates (id UUID PRIMARY KEY, owner_id UUID REFERENCES users(id), job_id UUID REFERENCES jobs(id), name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, role TEXT NOT NULL, experience TEXT, stage TEXT DEFAULT 'Applied', created_at TIMESTAMPTZ DEFAULT NOW());
