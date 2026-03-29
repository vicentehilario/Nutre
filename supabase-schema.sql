-- Perfis de usuário
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nome text,
  plano text not null default 'gratis', -- 'gratis', 'premium', 'nutri'
  fotos_hoje int not null default 0,
  streak int not null default 0,
  ultimo_registro date,
  created_at timestamptz default now()
);

-- Refeições registradas
create table public.refeicoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  foto_url text,
  descricao text,
  calorias int,
  proteinas numeric,
  carboidratos numeric,
  gorduras numeric,
  feedback_ia text,
  dentro_do_plano boolean,
  created_at timestamptz default now()
);

-- Storage bucket para fotos
insert into storage.buckets (id, name, public) values ('refeicoes', 'refeicoes', false);

-- RLS — cada usuário só vê seus dados
alter table public.profiles enable row level security;
alter table public.refeicoes enable row level security;

create policy "usuário vê só seu perfil"
  on public.profiles for all
  using (auth.uid() = id);

create policy "usuário vê só suas refeições"
  on public.refeicoes for all
  using (auth.uid() = user_id);

-- Storage: usuário acessa só sua pasta
create policy "upload próprio"
  on storage.objects for insert
  with check (bucket_id = 'refeicoes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "leitura própria"
  on storage.objects for select
  using (bucket_id = 'refeicoes' and auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger: cria perfil automaticamente ao cadastrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
