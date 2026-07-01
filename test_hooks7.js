/// <reference path="../pb_data/types.d.ts" />

// Log available DAO methods at startup to check API
$app.logger().info('[hook_test]', 'msg', 'startup');
$app.logger().info('[hook_test]', 'msg', 'typeof saveRecord=' + typeof $app.dao().saveRecord + ', typeof save=' + typeof $app.dao().save);

function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    $app.logger().info('[auditLog]', 'step', 'found_collection', 'name', auditCol.name);
    const log = $app.dao().createRecord(auditCol);
    $app.logger().info('[auditLog]', 'step', 'created_record');
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    $app.logger().info('[auditLog]', 'step', 'about_to_save');
    $app.dao().save(log);
    $app.logger().info('[auditLog]', 'step', 'save_succeeded');
  } catch (err) {
    $app.logger().info('[auditLog]', 'step', 'caught_error', 'error', err?.message || err?.toString() || String(err));
    $app.logger().info('[auditLog]', 'step', 'error_type', 'type', typeof err, 'keys', Object.keys(err || {}).join(','));
  }
}

onRecordAfterUpdateSuccess((e) => {
  auditLog('record_updated', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
