import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createServerClient } from '@supabase/ssr';
import { summarizeTutorMetrics } from '../src/application/tutor-metrics.ts';

const cases = JSON.parse(await readFile('tests/evaluation/tutor-cases.json','utf8'));
if (!process.argv.includes('--run')) {
  console.log(`${cases.length} casos preparados. Sin llamadas a IA. Usa --run con EVAL_EMAIL, EVAL_PASSWORD, EVAL_OUTPUT y .env.local configurados.`);
  process.exit(0);
}
const localEnv = Object.fromEntries((await readFile('.env.local','utf8')).split(/\r?\n/).filter(line=>/^[A-Z_]+=/.test(line.trim())).map(line=>{ const index=line.indexOf('=');return [line.slice(0,index).trim(),line.slice(index+1).trim().replace(/^"|"$/g,'')]; }));
const env = { ...localEnv, ...process.env };
if (!env.EVAL_EMAIL || !env.EVAL_PASSWORD || !env.EVAL_OUTPUT) throw new Error('Faltan credenciales de prueba o ruta de salida local.');
if (Number(env.TUTOR_MAX_BUDGET_USD)>0.02 || !(Number(env.TUTOR_MAX_BUDGET_USD)>0)) throw new Error('Esta evaluación requiere un tope positivo de hasta USD 0.02.');
const cookies = new Map();
const client = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
  cookies: { getAll:()=>[...cookies].map(([name,value])=>({name,value})),setAll:items=>items.forEach(({name,value})=>cookies.set(name,value)) },
});
const { data: auth, error: loginError } = await client.auth.signInWithPassword({email:env.EVAL_EMAIL,password:env.EVAL_PASSWORD});
if(loginError || !auth.user) throw new Error('No se pudo autenticar la cuenta de prueba.');
const {error:enrollmentError}=await client.from('enrollments').upsert({user_id:auth.user.id,course_slug:'fundamentos-python'},{onConflict:'user_id,course_slug',ignoreDuplicates:true});
if(enrollmentError) throw new Error('No se pudo matricular la cuenta de prueba.');
const results = [];
const conversations = new Map();
const output = resolve(env.EVAL_OUTPUT);
await mkdir(dirname(output),{recursive:true});
for(const item of cases) {
  const id=randomUUID(); const started=performance.now();
  const response=await fetch('http://localhost:3000/api/tutor',{
    method:'POST',headers:{'Content-Type':'application/json',Cookie:[...cookies].map(([name,value])=>`${name}=${value}`).join('; ')},
    body:JSON.stringify({requestId:id,courseSlug:'fundamentos-python',lessonSlug:'variables-y-tipos',question:item.question,conversationId:item.group?conversations.get(item.group):undefined}),
  });
  const body=await response.json();
  const {data:record,error}=await client.from('tutor_requests').select('id,status,model,prompt_tokens,completion_tokens,cached_tokens,latency_ms,cost_usd,reserved_cost_usd,feedback,truncated').eq('id',id).maybeSingle();
  if(error) throw new Error('No se pudieron recuperar las métricas de la consulta.');
  results.push({...item,requestId:id,httpStatus:response.status,roundTripMs:Math.round(performance.now()-started),answer:body.answer??null,error:body.error??null,record});
  if(item.group && body.conversationId) conversations.set(item.group,body.conversationId);
  const summary=summarizeTutorMetrics(results.flatMap(result=>result.record?[result.record]:[]));
  await writeFile(output,JSON.stringify({date:new Date().toISOString(),model:'deepseek-flash',budgetUsd:0.02,summary,results},null,2));
  console.log(`${item.id}: HTTP ${response.status}; registro ${record?.status??'no admitido'}`);
  if(!response.ok) break; // Un fallo no dispara reintentos ni más consumo.
}
console.log(`Evaluación guardada localmente; ${results.length} casos ejecutados.`);
