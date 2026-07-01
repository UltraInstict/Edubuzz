/// <reference path="../pb_data/types.d.ts" />

// Two onRecordCreate hooks
onRecordCreate((e) => {
  if (e.record.collection().name !== 'jobs') return;
  // no-op
}, 'jobs');

onRecordCreate((e) => {
  if (e.record.collection().name !== 'jobs') return;
  // no-op
}, 'jobs');

// onRecordAfterUpdateSuccess with save
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
