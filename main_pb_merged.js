/// <reference path="../pb_data/types.d.ts" />

// ─── Auto-slug on job create ────────────────────────────────────────────────
onRecordCreate((e) => {
  if (e.record.collection().name !== 'jobs') return;

  const title = e.record.get('title') || '';
  let slug = title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  // Ensure uniqueness
  let unique = slug;
  let i = 1;
  while (true) {
    try {
      $app.dao().findFirstRecordByFilter('jobs', `slug = "${unique}"`);
      unique = `${slug}-${i++}`;
    } catch {
      break; // slug is unique
    }
  }
  e.record.set('slug', unique);
}, 'jobs');

// ─── Set default 30-day expiry on job create ──────────────────────────────
onRecordCreate((e) => {
  if (e.record.collection().name !== 'jobs') return;
  if (!e.record.get('expires')) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    e.record.set('expires', expires.toISOString());
  }
}, 'jobs');

// ─── Auto-deactivate expired jobs on update ─────────────────────────────
onRecordUpdate((e) => {
  if (e.record.collection().name !== 'jobs') return;
  const expires = e.record.get('expires');
  if (expires && new Date(expires).getTime() <= Date.now()) {
    e.record.set('active', false);
    $app.logger().info('Auto-deactivated expired job', 'slug', e.record.get('slug'));
  }
}, 'jobs');

// ─── Audit logging ─────────────────────────────────────────────────────────
function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    const log = $app.dao().createRecord(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    $app.dao().save(log);
  } catch {
    // Audit collection may not exist yet — skip silently
  }
}

// ─── Combined onRecordAfterCreateSuccess ──────────────────────────────────
onRecordAfterCreateSuccess((e) => {
  // Application confirmation email
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
        subject: `Application received \u2014 ${jobTitle}`,
        html: `<p>Hi ${name},</p>
<p>Thank you for applying for <strong>${jobTitle}</strong> via Edubuzz. Your application has been received and forwarded to the employer.</p>
<p>Good luck! The Edubuzz team.</p>
<p style="color:#888;font-size:12px">Edubuzz.co.za \u2014 Find jobs in South Africa</p>`,
      });
    } catch (err) {
      $app.logger().error('Failed to send application confirmation', 'error', err);
    }
    return;
  }

  // Job alert emails
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

  // Audit log for all other collections
  auditLog('record_created', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});

// ─── Combined onRecordAfterUpdateSuccess ──────────────────────────────────
onRecordAfterUpdateSuccess((e) => {
  // Auto-approve pending jobs
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

  // Audit log for all collections
  auditLog('record_updated', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});

// ─── Combined onRecordAfterDeleteSuccess ──────────────────────────────────
onRecordAfterDeleteSuccess((e) => {
  auditLog('record_deleted', {
    collection: e.record.collection().name,
    id: e.record.id,
  });
});

// ─── Job expiry reminder (daily at 09:00 SAST = 07:00 UTC) ──────────────────
$app.cron().add('send-expiry-reminders', '0 7 * * *', () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStr = threeDaysFromNow.toISOString().slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);

    const expiringJobs = $app.dao().findRecordsByFilter(
      'jobs',
      `active=true&&expires>="${todayStr}"&&expires<="${threeDaysStr}"`,
      'expires',
      100,
      0
    );

    for (const job of expiringJobs) {
      const employerId = job.get('employer_id');
      const slug = job.get('slug');
      const title = job.get('title');
      const company = job.get('company');
      const expires = job.get('expires');

      if (!employerId) continue;

      try {
        const employer = $app.dao().findRecordById('employers', employerId);
        const email = employer.get('contact_email') || employer.get('company_email');
        if (!email) continue;

        const jobUrl = `https://edubuzz.co.za/job/${slug}`;
        const renewalUrl = `https://edubuzz.co.za/employer/upgrade`;

        $app.newMailClient().send({
          from: { address: $app.settings().smtp.username, name: 'Edubuzz' },
          to: [{ address: email }],
          subject: `Your listing "${title}" expires in 3 days \u2014 renew now`,
          html: `<p>Hi there,</p>
<p>Your job listing for <strong>${title}</strong> at ${company} will expire on <strong>${new Date(expires).toLocaleDateString('en-ZA')}</strong>.</p>
<p>Don't lose your applicants! Renew the listing or upgrade to a featured listing to get more visibility.</p>
<p><a href="${renewalUrl}" style="background:#2d6a4f;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">Renew or Upgrade Now</a></p>
<p style="margin-top:12px"><a href="${jobUrl}">View your listing</a></p>
<p style="color:#888;font-size:12px">Edubuzz.co.za \u2014 Find jobs in South Africa</p>`,
        });

        $app.logger().info('Sent expiry reminder', 'job', slug, 'email', email);
      } catch (err) {
        $app.logger().error('Failed to send expiry reminder for job', 'slug', slug, 'error', err);
      }
    }
  } catch (err) {
    $app.logger().error('Expiry reminder cron failed', 'error', err);
  }
});
