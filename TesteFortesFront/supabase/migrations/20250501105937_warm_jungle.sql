/*
  # Create initial schema for academic management system

  1. New Tables
    - `cursos`
      - `id` (uuid, primary key)
      - `nome` (text, not null)
      - `descricao` (text)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

    - `alunos`
      - `id` (uuid, primary key)
      - `nome` (text, not null)
      - `email` (text, unique, not null)
      - `data_nascimento` (date, not null)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

    - `matriculas`
      - `id` (uuid, primary key)
      - `aluno_id` (uuid, foreign key to alunos)
      - `curso_id` (uuid, foreign key to cursos)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create cursos table
CREATE TABLE IF NOT EXISTS cursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create alunos table
CREATE TABLE IF NOT EXISTS alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  data_nascimento date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matriculas table
CREATE TABLE IF NOT EXISTS matriculas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id) ON DELETE CASCADE,
  curso_id uuid REFERENCES cursos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(aluno_id, curso_id)
);

-- Enable RLS
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON cursos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON cursos
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON alunos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON alunos
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON matriculas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable write access for authenticated users" ON matriculas
  FOR ALL TO authenticated USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON cursos
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON alunos
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_matriculas_updated_at
  BEFORE UPDATE ON matriculas
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();