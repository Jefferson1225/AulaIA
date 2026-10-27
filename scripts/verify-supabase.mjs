import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

// Prueba optativa contra el proyecto configurado. Solo admite cuentas sintéticas.
if (!process.env.AULAIA_TEST_ACCOUNTS || !process.env.AULAIA_LIVE_OUTPUT) {
  console.log('Sin llamadas: configura AULAIA_TEST_ACCOUNTS y AULAIA_LIVE_OUTPUT con rutas locales externas al repositorio.');
  process.exit(0);
}
const env = Object.fromEntries((await readFile('.env.local','utf8')).split(/\r?\n/).filter(line=>/^[A-Z_]+=/.test(line.trim())).map(line=>{const i=line.indexOf('=');return[line.slice(0,i).trim(),line.slice(i+1).trim().replace(/^"|"$/g,'')];}));
const accounts = JSON.parse(await readFile(process.env.AULAIA_TEST_ACCOUNTS,'utf8')).slice(0,2);
assert.equal(accounts.length,2);
assert.ok(accounts.every(account=>account.email.startsWith('aulaia-cap2-') && account.email.endsWith('@example.invalid')),'Solo se permiten cuentas sintéticas de prueba.');
const clients = [];
for (const account of accounts) {
  const cookies = new Map();
  const client = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[...cookies].map(([name,value])=>({name,value})),setAll:items=>items.forEach(({name,value})=>cookies.set(name,value))}});
  const {error}=await client.auth.signInWithPassword({email:account.email,password:account.password});
  if(error) throw new Error('No se pudo iniciar sesión con la cuenta de prueba.');
  clients.push({client,cookies});
}
const [a,b]=clients; const checks=[];
async function check(name,run) { try { await run();checks.push({name,passed:true});console.log(`OK: ${name}`); } catch { checks.push({name,passed:false});console.log(`FALLO: ${name}`); } }
const course='fundamentos-python'; const lesson='variables-y-tipos';
await check('Una cuenta nueva conserva el rol student',async()=>{const {data,error}=await a.client.from('profiles').select('role').eq('id',accounts[0].id).single();assert.equal(error,null);assert.equal(data.role,'student');});
await check('El estudiante no puede elevar su rol',async()=>{const {error}=await a.client.from('profiles').update({role:'admin'}).eq('id',accounts[0].id);assert.equal(error?.code,'42501');});
await check('Contenido publicado disponible en Supabase',async()=>{const {data,error}=await a.client.from('lessons').select('slug').eq('course_slug',course);assert.equal(error,null);assert.ok(data.some(row=>row.slug===lesson));});
await check('Matrícula idempotente',async()=>{for(let i=0;i<2;i++){const {error}=await a.client.from('enrollments').upsert({user_id:accounts[0].id,course_slug:course},{onConflict:'user_id,course_slug',ignoreDuplicates:true});assert.equal(error,null);}const {data}=await a.client.from('enrollments').select('course_slug').eq('course_slug',course);assert.equal(data.length,1);});
await check('Lección completada sin duplicados',async()=>{for(let i=0;i<2;i++){const {error}=await a.client.from('lesson_completions').upsert({user_id:accounts[0].id,course_slug:course,lesson_slug:lesson},{onConflict:'user_id,course_slug,lesson_slug',ignoreDuplicates:true});assert.equal(error,null);}const {data}=await a.client.from('lesson_completions').select('lesson_slug').eq('course_slug',course);assert.equal(data.length,1);});
await check('Progreso ajeno invisible',async()=>{const {data,error}=await b.client.from('lesson_completions').select('*').eq('user_id',accounts[0].id);assert.equal(error,null);assert.equal(data.length,0);});
await check('No se puede modificar progreso ajeno',async()=>{const {error}=await b.client.from('lesson_completions').insert({user_id:accounts[0].id,course_slug:course,lesson_slug:lesson});assert.equal(error?.code,'42501');});
const assessment='ea100000-0000-4000-8000-000000000001';
const answers=[0,1,2].map((optionIndex,index)=>({questionId:`ea200000-0000-4000-8000-00000000000${index+1}`,optionIndex}));
let attemptId;
await check('Calificación 20/20 e intento idempotente',async()=>{const requestId=randomUUID();const input={p_assessment_id:assessment,p_answers:answers,p_request_id:requestId,p_version:1};const first=await a.client.rpc('submit_assessment',input);assert.equal(first.error,null);attemptId=first.data;const second=await a.client.rpc('submit_assessment',input);assert.equal(second.data,attemptId);const {data,error}=await a.client.from('assessment_attempts').select('score,correct_count,passed').eq('id',attemptId).single();assert.equal(error,null);assert.equal(Number(data.score),20);assert.equal(data.correct_count,3);assert.equal(data.passed,true);});
await check('Calificación parcial 6.67/20',async()=>{const input={p_assessment_id:assessment,p_answers:answers.map(answer=>({...answer,optionIndex:0})),p_request_id:randomUUID(),p_version:1};const result=await a.client.rpc('submit_assessment',input);assert.equal(result.error,null);const {data}=await a.client.from('assessment_attempts').select('score,passed').eq('id',result.data).single();assert.equal(Number(data.score),6.67);assert.equal(data.passed,false);});
await check('Resultados ajenos invisibles',async()=>{const {data,error}=await b.client.from('assessment_attempts').select('id').eq('id',attemptId);assert.equal(error,null);assert.equal(data.length,0);});
await check('Claves de respuestas fuera de la API pública',async()=>{const {error}=await a.client.schema('aulaia_private').from('assessment_answer_keys').select('*');assert.ok(error);});
await check('Conversaciones ajenas invisibles',async()=>{const {data,error}=await b.client.from('tutor_requests').select('id').eq('user_id',accounts[0].id);assert.equal(error,null);assert.equal(data.length,0);});
await check('No se pueden falsificar respuestas del tutor',async()=>{const {error}=await a.client.from('tutor_requests').update({answer:'Falsificada'}).eq('user_id',accounts[0].id);assert.equal(error?.code,'42501');});
await check('Métricas globales restringidas a administración',async()=>{const {error}=await a.client.rpc('get_tutor_metrics');assert.equal(error?.code,'42501');});
await check('Historial se recupera desde el endpoint autenticado',async()=>{const response=await fetch(`http://localhost:3000/api/tutor?courseSlug=${course}&lessonSlug=${lesson}`,{headers:{Cookie:[...a.cookies].map(([name,value])=>`${name}=${value}`).join('; ')}});assert.equal(response.status,200);const data=await response.json();assert.ok(data.turns.length>0);});
await check('Endpoint del tutor rechaza acceso anónimo',async()=>{const response=await fetch('http://localhost:3000/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(response.status,401);});
await check('La clave pública no permite leer perfiles sin sesión',async()=>{const anonymous=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});const {error}=await anonymous.from('profiles').select('*');assert.equal(error?.code,'42501');});
await writeFile(process.env.AULAIA_LIVE_OUTPUT,JSON.stringify({date:new Date().toISOString(),passed:checks.filter(item=>item.passed).length,total:checks.length,checks},null,2));
if(checks.some(item=>!item.passed)) process.exitCode=1;
