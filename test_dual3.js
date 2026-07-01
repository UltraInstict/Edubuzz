/// <reference path="../pb_data/types.d.ts" />

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

// Auto-approve pending jobs
onRecordAfterUpdateSuccess((e) => {
  if (e.record.collection().name !== 'pending_jobs') return;
  if (e.record.get('status') !== 'approved') return;
  try {
    const jobsCol = $app.dao().findCollectionByNameOrId('jobs');
    const job = $app.dao().createRecord(jobsCol);
    job.set('title', e.record.get('title'));
    job.set('company', e.record.get('company'));
    $app.dao().save(job);
  } catch (err) {
    $app.logger().error('Failed', 'error', err);
  }
}, 'pending_jobs');
