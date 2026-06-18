-- ═══════════════════════════════════════════════════════════════
-- Start.AI — Supabase Setup
-- Execute no Supabase Dashboard: SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════

-- 1. Tabela de perfis (estende auth.users com o nome do aluno)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  created_at timestamptz default now()
);

-- 2. Tabela de comentários (compartilhados entre todos os alunos)
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  user_name text not null,
  lesson_id int not null check (lesson_id >= 0 and lesson_id <= 4),
  text text not null check (char_length(text) > 0 and char_length(text) <= 500),
  created_at timestamptz default now()
);

-- 3. Tabela de curtidas (many-to-many entre usuários e comentários)
create table if not exists comment_likes (
  user_id uuid references auth.users on delete cascade not null,
  comment_id uuid references comments on delete cascade not null,
  primary key (user_id, comment_id)
);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────
alter table profiles enable row level security;
alter table comments enable row level security;
alter table comment_likes enable row level security;

-- Profiles
create policy "Perfis visíveis para todos" on profiles
  for select using (true);

create policy "Usuário cria seu próprio perfil" on profiles
  for insert with check (auth.uid() = id);

create policy "Usuário atualiza seu próprio perfil" on profiles
  for update using (auth.uid() = id);

-- Comments
create policy "Comentários visíveis para todos" on comments
  for select using (true);

create policy "Usuários autenticados podem comentar" on comments
  for insert with check (auth.uid() = user_id);

create policy "Usuário apaga seus próprios comentários" on comments
  for delete using (auth.uid() = user_id);

-- Comment likes
create policy "Curtidas visíveis para todos" on comment_likes
  for select using (true);

create policy "Usuário pode curtir" on comment_likes
  for insert with check (auth.uid() = user_id);

create policy "Usuário pode descurtir" on comment_likes
  for delete using (auth.uid() = user_id);

-- 4. Tabela de tickets de suporte
create table if not exists support_tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  user_name text not null,
  user_email text not null,
  message text not null check (char_length(message) > 0 and char_length(message) <= 2000),
  created_at timestamptz default now()
);

alter table support_tickets enable row level security;

create policy "Usuário autenticado cria ticket" on support_tickets
  for insert with check (true);

create policy "Somente service_role lê tickets" on support_tickets
  for select using (false);

-- ─── ÍNDICES (performance) ─────────────────────────────────────
create index if not exists comments_lesson_id_idx on comments(lesson_id);
create index if not exists comments_created_at_idx on comments(created_at desc);
create index if not exists comment_likes_comment_id_idx on comment_likes(comment_id);
create index if not exists support_tickets_created_at_idx on support_tickets(created_at desc);
