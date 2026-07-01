/// <reference path="../pb_data/types.d.ts" />

$app.logger().info('[hook_test]', 'msg', 'test_inc1_startup');

function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    const log = $app.dao().createRecord(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    $app.dao().save(log);
  } catch (err) {
    $app.logger().error('[auditLog] error', 'err', String(err));
  }
}

onRecordAfterUpdateSuccess((e) => {
  auditLog('record_updated', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});

onRecordAfterCreateSuccess((e) => {
  auditLog('record_created', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
