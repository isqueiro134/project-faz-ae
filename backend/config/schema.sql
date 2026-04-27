-- Habilitar chaves estrangeiras no SQLite
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE profiles (
    id TEXT PRIMARY KEY NOT NULL,
    avatar_url TEXT NULL,
    bio TEXT NULL,
    phone TEXT UNIQUE NULL,
    email_verified INTEGER DEFAULT 0, -- 0 = falso, 1 = verdadeiro
    phone_verified INTEGER DEFAULT 0, -- 0 = falso, 1 = verdadeiro
    is_verified INTEGER DEFAULT 0,     
    user_type TEXT DEFAULT 'client' CHECK(user_type IN ('client', 'freelancer', 'both')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE client_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    -- Documentação (Pode ser CPF ou CNPJ)
    tax_id TEXT UNIQUE NULL,
    total_published_jobs INTEGER DEFAULT 0,
    total_paid_jobs INTEGER DEFAULT 0,
    rating_average REAL DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    company_name TEXT NULL, -- Caso seja uma empresa
    website_url TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE freelancer_profiles (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL UNIQUE,
    professional_title TEXT NULL,
    hourly_rate REAL NULL,
    skills TEXT DEFAULT '[]', 
    portfolio_url TEXT NULL,
    rating_average REAL DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE jobs (
    -- SQLite não tem gen_random_uuid() nativo, usamos TEXT para UUIDs gerados pela aplicação
    id TEXT PRIMARY KEY NOT NULL, 
    client_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('hourly', 'fixed')),
    project_size TEXT NOT NULL CHECK (project_size IN ('small', 'medium', 'large')),
    required_skills TEXT NOT NULL DEFAULT '[]',
    -- Conforme discutimos, REAL para cálculos simples ou INTEGER para centavos
    estimated_budget REAL NULL, 
    status TEXT DEFAULT 'aberto',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT jobs_status_check CHECK (status IN ('aberto', 'em_andamento', 'concluido', 'cancelado'))
);

CREATE TABLE proposals (
    id TEXT PRIMARY KEY NOT NULL,
    job_id TEXT NOT NULL,
    freelancer_id TEXT NOT NULL,
    proposal_value INTEGER NOT NULL,
    message TEXT NULL,
    status TEXT DEFAULT 'pendente',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (job_id, freelancer_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT proposals_status_check CHECK (status IN ('pendente', 'aceita', 'recusada', 'concluida'))
);

CREATE TABLE reviews (
    id TEXT PRIMARY KEY NOT NULL,
    job_id TEXT NOT NULL REFERENCES jobs(id),
    from_user_id TEXT NOT NULL REFERENCES profiles(id),
    to_user_id TEXT NOT NULL REFERENCES profiles(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    role TEXT CHECK(role IN ('client', 'freelancer')), -- Define se o avaliado estava agindo como freelancer ou cliente
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);