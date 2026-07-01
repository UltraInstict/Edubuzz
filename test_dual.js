/// <reference path="../pb_data/types.d.ts" />

onRecordAfterUpdateSuccess((e) => {
  // first hook - filtered
}, 'pending_jobs');

onRecordAfterUpdateSuccess((e) => {
  // second hook - unfiltered
});
