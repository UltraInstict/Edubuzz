require('dotenv').config();
var http = require('http');
function api(m, p, b, t) {
  return new Promise(r => {
    var o = { method: m, headers: { 'Content-Type': 'application/json' } };
    if (t) o.headers['Authorization'] = 'Bearer ' + t;
    var req = http.request('http://127.0.0.1:8090' + p, o, res => {
      var d = ''; res.on('data', c => d += c); res.on('end', () => {
        try { r(JSON.parse(d)); } catch(e) { r({ _raw: d }); }
      });
    });
    req.on('error', e => r({ error: e.message }));
    if (b) req.write(JSON.stringify(b));
    req.end();
  });
}
(async () => {
  var auth = await api('POST', '/api/collections/_superusers/auth-with-password', { identity: process.env.PB_ADMIN_EMAIL, password: process.env.PB_ADMIN_PASSWORD });
  var t = auth.token;
  var jobs = await api('GET', '/api/collections/jobs/records?perPage=100', null, t);
  for (var j of jobs.items) {
    if (j.title.indexOf('NOHOOKS') === 0 || j.title.indexOf('MINHOOKS') === 0) {
      await api('DELETE', '/api/collections/jobs/records/' + j.id, null, t);
      console.log('Deleted:', j.title);
    }
  }
  var cats = await api('GET', '/api/collections/categories/records?perPage=50', null, t);
  for (var c of cats.items) {
    if (c.name && c.name.indexOf('TEST-') === 0) {
      var d = await api('DELETE', '/api/collections/categories/records/' + c.id, null, t);
      console.log('Delete category:', c.name, d.id ? 'OK' : 'FAIL');
    }
  }
  var final = await api('GET', '/api/collections/jobs/records?perPage=1', null, t);
  console.log('Final job count:', final.totalItems);
})();
