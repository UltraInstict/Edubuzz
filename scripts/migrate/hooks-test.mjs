#!/usr/bin/env node
/** Test job create/update persistence against a PB with hooks loaded. Targets env PB_URL. */
import { readFileSync } from 'node:fs';
function loadEnv(p){const e={};try{for(const l of readFileSync(p,'utf8').split('\n')){const m=l.match(/^([A-Z0-9_]+)=(.*)$/);if(m)e[m[1]]=m[2].trim();}}catch{}return e;}
const cfg={...loadEnv(process.env.ENV_PATH||'/home/edubuzz/app/.env'),...process.env};
const BASE=cfg.PB_URL;let T='';
const H=()=>({'Content-Type':'application/json',Authorization:T});
async function api(p,o={}){const r=await fetch(BASE+p,o);const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`${r.status} ${p}: ${JSON.stringify(b).slice(0,200)}`);return b;}
const out=[];const ck=(n,c,d)=>out.push({n,pass:!!c,d});
async function main(){
  T=(await api('/api/collections/_superusers/auth-with-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identity:cfg.PB_ADMIN_EMAIL,password:cfg.PB_ADMIN_PASSWORD})})).token;
  // create WITHOUT slug -> hook should fill it and persist
  const created=await api('/api/collections/jobs/records',{method:'POST',headers:H(),body:JSON.stringify({title:'Hook Test Role',company:'HookCo',description:'<p>A sufficiently long description for the hook persistence test of create.</p>',province:'Gauteng',city:'Jozi',job_type:'Full-time',apply_url:'https://hookco.example/apply',source:'hooktest',source_ref:'hooktest-1',active:true})});
  ck('create.persisted',!!created.id,{id:created.id});
  ck('create.autoslug',!!created.slug,{slug:created.slug});
  ck('create.expiry_default',!!created.expires,{expires:created.expires});
  // update -> should persist
  await api(`/api/collections/jobs/records/${created.id}`,{method:'PATCH',headers:H(),body:JSON.stringify({city:'Testville',fingerprint:'abc12345'})});
  const back=await api(`/api/collections/jobs/records/${created.id}`,{headers:H()});
  ck('update.persisted',back.city==='Testville'&&back.fingerprint==='abc12345',{city:back.city,fp:back.fingerprint});
  // cleanup
  await api(`/api/collections/jobs/records/${created.id}`,{method:'DELETE',headers:H()});
  const failed=out.filter(x=>!x.pass);
  console.log(JSON.stringify({passed:out.length-failed.length,failed:failed.length,checks:out},null,2));
  if(failed.length){console.error('HOOKS_TEST_FAILED');process.exit(1);}
  console.log('HOOKS_TEST_OK');
}
main().catch(e=>{console.error('HOOKS_TEST_ERROR',e.message);process.exit(1);});
