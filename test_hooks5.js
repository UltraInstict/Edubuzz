/// <reference path="../pb_data/types.d.ts" />

// Audit logging
function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    const log = new Record(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    $app.dao().save(log);
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
