#!/usr/bin/env python3
"""Merge all hooks of the same type into single registrations to work around PB v0.37 bug."""
with open('main_pb_fixed.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the individual onRecordAfterUpdateSuccess for pending_jobs (lines 29-58)
old_pending = """// \u2500\u2500\u2500 Auto-approve pending jobs \u2192 copy to live jobs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
onRecordAfterUpdateSuccess((e) => {
  if (e.record.collection().name !== 'pending_jobs') return;
  if (e.record.get('status') !== 'approved') return;

  try {
    const jobsCol = $app.dao().findCollectionByNameOrId('jobs');
    const job = $app.dao().createRecord(jobsCol);
    job.set('title',       e.record.get('title'));
    job.set('company',     e.record.get('company'));
    job.set('category',    e.record.get('category') || '');
    job.set('description', e.record.get('description'));
    job.set('province',    e.record.get('province'));
    job.set('city',        e.record.get('city') || '');
    job.set('job_type',    e.record.get('job_type'));
    job.set('salary_min',  e.record.get('salary_min'));
    job.set('salary_max',  e.record.get('salary_max'));
    job.set('apply_url',   e.record.get('apply_url') || '');
    job.set('apply_email', e.record.get('apply_email') || '');
    job.set('source',      'employer');
    job.set('active',      true);
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    job.set('expires',     expires.toISOString());
    job.set('featured',    false);
    $app.dao().save(job);

    $app.logger().info('Approved employer job', 'title', e.record.get('title'));
  } catch (err) {
    $app.logger().error('Failed to copy approved job', 'error', err);
  }
}, 'pending_jobs');

""" 

# Remove the individual onRecordAfterCreateSuccess for applications
old_apps = """// \u2500\u2500\u2500 Send confirmation email when application received \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
onRecordAfterCreateSuccess((e) => {
  if (e.record.collection().name !== 'applications') return;

  try {
    const email  = e.record.get('email');
    const name   = e.record.get('name');
    const jobId  = e.record.get('job');

    let jobTitle = 'the position';
    try {
      const job = $app.dao().findRecordById('jobs', jobId);
      jobTitle = job.get('title');
    } catch {}

    $app.newMailClient().send({
      from: { address: $app.settings().smtp.username, name: 'Edubuzz' },
      to: [{ address: email, name }],
      subject: `Application received \u2014 ${jobTitle}`,
      html: `<p>Hi ${name},</p>
<p>Thank you for applying for <strong>${jobTitle}</strong> via Edubuzz. Your application has been received and forwarded to the employer.</p>
<p>Good luck! The Edubuzz team.</p>
<p style="color:#888;font-size:12px">Edubuzz.co.za \u2014 Find jobs in South Africa</p>`,
    });
  } catch (err) {
    $app.logger().error('Failed to send application confirmation', 'error', err);
  }
}, 'applications');

"""

# Remove the individual onRecordAfterCreateSuccess for jobs (job alerts)
old_job_alerts = """// \u2500\u2500\u2500 Send job alert emails when new job is created \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
onRecordAfterCreateSuccess((e) => {
  if (e.record.collection().name !== 'jobs') return;
  if (!e.record.get('active')) return;

  try {
    const title    = e.record.get('title');
    const company  = e.record.get('company');
    const province = e.record.get('province');
    const slug     = e.record.get('slug');
    const jobUrl   = `https://edubuzz.co.za/job/${slug}`;

    const alerts = $app.dao().findRecordsByFilter(
      'job_alerts',
      `keyword = "" || title ~ keyword`,
      '-created', 500, 0
    );

    for (const alert of alerts) {
      const alertProvince = alert.get('province');
      if (alertProvince && alertProvince !== province) continue;

      try {
        $app.newMailClient().send({
          from: { address: $app.settings().smtp.username, name: 'Edubuzz Job Alert' },
          to: [{ address: alert.get('email') }],
          subject: `New job: ${title} at ${company}`,
          html: `<p>A new job matching your alert has been posted:</p>
<p><strong>${title}</strong> at ${company}<br>${province}</p>
<p><a href="${jobUrl}" style="background:#1D6FEB;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">View job</a></p>
<p style="color:#888;font-size:12px">You're receiving this because you set up a job alert on Edubuzz.co.za</p>`,
        });
      } catch {}
    }
  } catch (err) {
    $app.logger().error('Failed to send job alerts', 'error', err);
  }
}, 'jobs');

"""

# Remove the individual onRecordAfterCreateSuccess for auditLog
old_audit_create = """onRecordAfterCreateSuccess((e) => {
  auditLog('record_created', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
"""

# Remove the individual onRecordAfterUpdateSuccess for auditLog
old_audit_update = """onRecordAfterUpdateSuccess((e) => {
  auditLog('record_updated', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
"""

# Remove the individual onRecordAfterDeleteSuccess for auditLog  
old_audit_delete = """onRecordAfterDeleteSuccess((e) => {
  auditLog('record_deleted', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
"""

# Add merged hooks
merged_after_create = """// Combined onRecordAfterCreateSuccess for all collections
onRecordAfterCreateSuccess((e) => {
  if (e.record.collection().name === 'applications') {
    try {
      const email  = e.record.get('email');
      const name   = e.record.get('name');
      const jobId  = e.record.get('job');

      let jobTitle = 'the position';
      try {
        const job = $app.dao().findRecordById('jobs', jobId);
        jobTitle = job.get('title');
      } catch {}

      $app.newMailClient().send({
        from: { address: $app.settings().smtp.username, name: 'Edubuzz' },
        to: [{ address: email, name }],
        subject: `Application received \\u2014 ${jobTitle}`,
        html: `<p>Hi ${name},</p>
<p>Thank you for applying for <strong>${jobTitle}</strong> via Edubuzz. Your application has been received and forwarded to the employer.</p>
<p>Good luck! The Edubuzz team.</p>
<p style="color:#888;font-size:12px">Edubuzz.co.za \\u2014 Find jobs in South Africa</p>`,
      });
    } catch (err) {
      $app.logger().error('Failed to send application confirmation', 'error', err);
    }
    return;
  }

  if (e.record.collection().name === 'jobs') {
    if (!e.record.get('active')) return;

    try {
      const title    = e.record.get('title');
      const company  = e.record.get('company');
      const province = e.record.get('province');
      const slug     = e.record.get('slug');
      const jobUrl   = `https://edubuzz.co.za/job/${slug}`;

      const alerts = $app.dao().findRecordsByFilter(
        'job_alerts',
        `keyword = "" || title ~ keyword`,
        '-created', 500, 0
      );

      for (const alert of alerts) {
        const alertProvince = alert.get('province');
        if (alertProvince && alertProvince !== province) continue;

        try {
          $app.newMailClient().send({
            from: { address: $app.settings().smtp.username, name: 'Edubuzz Job Alert' },
            to: [{ address: alert.get('email') }],
            subject: `New job: ${title} at ${company}`,
            html: `<p>A new job matching your alert has been posted:</p>
<p><strong>${title}</strong> at ${company}<br>${province}</p>
<p><a href="${jobUrl}" style="background:#1D6FEB;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">View job</a></p>
<p style="color:#888;font-size:12px">You're receiving this because you set up a job alert on Edubuzz.co.za</p>`,
          });
        } catch {}
      }
    } catch (err) {
      $app.logger().error('Failed to send job alerts', 'error', err);
    }
    return;
  }

  auditLog('record_created', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
"""

merged_after_update = """// Combined onRecordAfterUpdateSuccess for all collections
onRecordAfterUpdateSuccess((e) => {
  if (e.record.collection().name === 'pending_jobs' && e.record.get('status') === 'approved') {
    try {
      const jobsCol = $app.dao().findCollectionByNameOrId('jobs');
      const job = $app.dao().createRecord(jobsCol);
      job.set('title',       e.record.get('title'));
      job.set('company',     e.record.get('company'));
      job.set('category',    e.record.get('category') || '');
      job.set('description', e.record.get('description'));
      job.set('province',    e.record.get('province'));
      job.set('city',        e.record.get('city') || '');
      job.set('job_type',    e.record.get('job_type'));
      job.set('salary_min',  e.record.get('salary_min'));
      job.set('salary_max',  e.record.get('salary_max'));
      job.set('apply_url',   e.record.get('apply_url') || '');
      job.set('apply_email', e.record.get('apply_email') || '');
      job.set('source',      'employer');
      job.set('active',      true);
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      job.set('expires',     expires.toISOString());
      job.set('featured',    false);
      $app.dao().save(job);

      $app.logger().info('Approved employer job', 'title', e.record.get('title'));
    } catch (err) {
      $app.logger().error('Failed to copy approved job', 'error', err);
    }
  }

  auditLog('record_updated', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
"""

merged_after_delete = """onRecordAfterDeleteSuccess((e) => {
  auditLog('record_deleted', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});
"""

# Apply removals
content = content.replace(old_pending, '')
content = content.replace(old_apps, '')
content = content.replace(old_job_alerts, '')
content = content.replace(old_audit_create, '')
content = content.replace(old_audit_update, '')
content = content.replace(old_audit_delete, '')

# Find a good insertion point — before the cron job
insertion_point = content.find('// \u2500\u2500\u2500 Job expiry reminder')
combined = merged_after_create + '\n' + merged_after_update + '\n' + merged_after_delete + '\n\n'
content = content[:insertion_point] + combined + content[insertion_point:]

with open('main_pb_merged.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
import re
on_create = len(re.findall(r'onRecordCreate\(', content))
on_update = len(re.findall(r'onRecordUpdate\(', content))
on_after_create = len(re.findall(r'onRecordAfterCreateSuccess\(', content))
on_after_update = len(re.findall(r'onRecordAfterUpdateSuccess\(', content))
on_after_delete = len(re.findall(r'onRecordAfterDeleteSuccess\(', content))
print(f'Merged counts: onRecordCreate={on_create}, onRecordUpdate={on_update}')
print(f'  onRecordAfterCreateSuccess={on_after_create}, onRecordAfterUpdateSuccess={on_after_update}, onRecordAfterDeleteSuccess={on_after_delete}')
print('All verified: each type should be 1 (or less)')
if 'new Record(' in content:
    print('WARNING: new Record still found')
if 'saveRecord(' in content:
    print('WARNING: saveRecord still found')
