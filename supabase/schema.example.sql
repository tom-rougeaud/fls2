-- =====================================================================
-- Maths Allophones · Niveau 2 — tables et dossier des voix du professeur
-- À lancer UNE FOIS dans Supabase : SQL Editor → New query → coller → Run.
-- Remplacer ton.adresse@exemple.fr par l’adresse e-mail du compte professeur.
-- Ne touche pas aux tables du niveau 1 (fls_clips, fls_textes, fls-voix).
-- =====================================================================
create table if not exists public.fls2_clips (
  id uuid primary key default gen_random_uuid(),
  cle text not null,
  texte text not null,
  chemin text not null,
  duree real default 0,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists fls2_clips_cle on public.fls2_clips (cle);

create table if not exists public.fls2_textes (
  id uuid primary key default gen_random_uuid(),
  evenement text not null,
  texte text not null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.fls2_clips enable row level security;
alter table public.fls2_textes enable row level security;

-- Tout le monde peut écouter (lecture) ; seul le professeur peut écrire.
drop policy if exists "fls2_clips lecture" on public.fls2_clips;
create policy "fls2_clips lecture" on public.fls2_clips for select using (true);
drop policy if exists "fls2_clips professeur" on public.fls2_clips;
create policy "fls2_clips professeur" on public.fls2_clips for all to authenticated
  using ((auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr')
  with check ((auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');

drop policy if exists "fls2_textes lecture" on public.fls2_textes;
create policy "fls2_textes lecture" on public.fls2_textes for select using (true);
drop policy if exists "fls2_textes professeur" on public.fls2_textes;
create policy "fls2_textes professeur" on public.fls2_textes for all to authenticated
  using ((auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr')
  with check ((auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');

-- Dossier public des sons du niveau 2
insert into storage.buckets (id, name, public) values ('fls2-voix', 'fls2-voix', true)
  on conflict (id) do update set public = true;

drop policy if exists "fls2-voix lecture" on storage.objects;
create policy "fls2-voix lecture" on storage.objects for select using (bucket_id = 'fls2-voix');
drop policy if exists "fls2-voix ajout" on storage.objects;
create policy "fls2-voix ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'fls2-voix' and (auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');
drop policy if exists "fls2-voix modification" on storage.objects;
create policy "fls2-voix modification" on storage.objects for update to authenticated
  using (bucket_id = 'fls2-voix' and (auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');
drop policy if exists "fls2-voix suppression" on storage.objects;
create policy "fls2-voix suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'fls2-voix' and (auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');
