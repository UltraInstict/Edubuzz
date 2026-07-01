/// <reference path="../pb_data/types.d.ts" />

// Audit logging — NO TRY/CATCH, let the error surface
function auditLog(event, details) {
  const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
  const log = new Record(auditCol);
  log.set('event', event);
  log.set('details', JSON.stringify(details));
  $app.logger().info('[auditLog]', 'step', 'before_save', 'event', event, 'collection', details?.collection);
  $app.dao().save(log);
  $app.logger().info('[auditLog]', 'step', 'after_save');
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
