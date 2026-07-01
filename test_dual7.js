/// <reference path="../pb_data/types.d.ts" />

onRecordAfterUpdateSuccess((e) => {
  try {
    // First save
    const col = $app.dao().findCollectionByNameOrId('audit_logs');
    const log1 = $app.dao().createRecord(col);
    log1.set('event', 'first');
    log1.set('details', '{}');
    $app.dao().save(log1);
    
    // Second save
    const log2 = $app.dao().createRecord(col);
    log2.set('event', 'second');
    log2.set('details', '{}');
    $app.dao().save(log2);
  } catch (err) {
    $app.logger().error('Dual save error', 'msg', err?.message || String(err));
  }
});
