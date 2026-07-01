/// <reference path="../pb_data/types.d.ts" />

// onRecordUpdate for jobs (no DB save, just set field)
onRecordUpdate((e) => {
  if (e.record.collection().name !== 'jobs') return;
  const expires = e.record.get('expires');
  if (expires && new Date(expires).getTime() <= Date.now()) {
    e.record.set('active', false);
  }
}, 'jobs');

// Single onRecordAfterUpdateSuccess with auditLog
function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    const log = $app.dao().createRecord(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    $app.dao().save(log);
  } catch {
  }
}

onRecordAfterUpdateSuccess((e) => {
  auditLog('record_updated', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
