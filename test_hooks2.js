/// <reference path="../pb_data/types.d.ts" />

// Auto-deactivate expired jobs on update
onRecordUpdate((e) => {
  if (e.record.collection().name !== 'jobs') return;
  const expires = e.record.get('expires');
  if (expires && new Date(expires).getTime() <= Date.now()) {
    e.record.set('active', false);
    $app.logger().info('Auto-deactivated expired job', 'slug', e.record.get('slug'));
  }
}, 'jobs');

// Audit logging
function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    const log = new Record(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    log.set('created', new Date().toISOString());
    $app.dao().saveRecord(log);
  } catch {
    // skip silently
  }
}

onRecordAfterCreateSuccess((e) => {
  auditLog('record_created', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});

onRecordAfterUpdateSuccess((e) => {
  auditLog('record_updated', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});

onRecordAfterDeleteSuccess((e) => {
  auditLog('record_deleted', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
