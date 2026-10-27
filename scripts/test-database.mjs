import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';

const db = new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; grant usage on schema public,auth to anon,authenticated,service_role;
    create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
  for (const file of (await readdir('supabase/migrations')).filter(name=>name.endsWith('.sql')).sort()) {
    await db.exec(await readFile(`supabase/migrations/${file}`,'utf8'));
    console.log(`Migración: ${file}`);
  }
  for (const file of (await readdir('supabase/tests')).filter(name=>name.endsWith('.sql')).sort()) {
    await db.exec(await readFile(`supabase/tests/${file}`,'utf8'));
    console.log(`Prueba SQL aprobada: ${file}`);
  }
} catch (error) {
  console.error(`Prueba SQL fallida: ${error.message}`);
  process.exitCode = 1;
} finally { await db.close(); }
