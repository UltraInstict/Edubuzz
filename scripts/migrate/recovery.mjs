#!/usr/bin/env node
/** Restore the lost job record (from /tmp/lost.json) into prod via superuser API. Idempotent. */
import { readFileSync } from 'node:fs';
function loadEnv(p){const e={};try{for(const l of readFileSync(p,'utf8').split('\n')){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)e[m[1]]=m[2].trim();}}catch{}return e;}
const cfg={...loadEnv('/home/edubuzz/app/.env'),...process.env};
const BASE=cfg.PB_URL||'http://127.0.0.1:8090';let T='';
const H=()=>({'Content-Type':'application/json',Authorization:T});
async function api(p,o={}){const r=await fetch(BASE+p,o);const b=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(`${r.status} ${p}: ${JSON.stringify(b).slice(0,300)}`);e.status=r.status;throw e;}return b;}
async function main(){
  const rows=JSON.parse(readFileSync('/tmp/lost.json','utf8'));
  if(!rows.length){console.log('NO_LOST_ROW');return;}
  const j=rows[0];
  T=(await api('/api/collections/_superusers/auth-with-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identity:cfg.PB_ADMIN_EMAIL,password:cfg.PB_ADMIN_PASSWORD})})).token;
  // already present?
  try{ await api('/api/collections/jobs/records/'+j.id,{headers:H()}); console.log('ALREADY_PRESENT '+j.id); return; }catch(e){ if(e.status!==404) throw e; }
  const payload={
    id:j.id, title:j.title, slug:j.slug, company:j.company, category:j.category||'',
    province:j.province||'', city:j.city||'', description:j.description||'',
    apply_url:j.apply_url||'', apply_email:j.apply_email||'',
    salary_min:j.salary_min??null, salary_max:j.salary_max??null,
    job_type:j.job_type||'Full-time', source:j.source||'manual',
    featured:!!j.featured, active:j.active===undefined?true:!!j.active,
    xml_export:j.xml_export===undefined?true:!!j.xml_export, expires:j.expires||null,
  };
  const created=await api('/api/collections/jobs/records',{method:'POST',headers:H(),body:JSON.stringify(payload)});
  console.log('RESTORED id='+created.id+' slug='+created.slug);
}
main().catch(e=>{console.error('RECOVERY_ERR',e.message);process.exit(1);});
