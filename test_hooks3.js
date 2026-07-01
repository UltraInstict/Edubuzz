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
