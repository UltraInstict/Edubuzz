/// <reference path="../pb_data/types.d.ts" />

// ─── Auto-slug on job create ────────────────────────────────────────────────
onRecordBeforeCreateRequest((e) => {
  if (e.record.collection().name !== 'jobs') return;

  const title   = e.record.get('title') || '';
  const company = e.record.get('company') || '';
  let slug = (title + '-' + company)
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

// ─── Auto-approve pending jobs → copy to live jobs ──────────────────────────
onRecordAfterUpdateRequest((e) => {
  if (e.record.collection().name !== 'pending_jobs') return;
  if (e.record.get('status') !== 'approved') return;

  try {
    const jobsCol = $app.dao().findCollectionByNameOrId('jobs');
    const job = new Record(jobsCol);
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
    job.set('ai_written',  false);
    $app.dao().saveRecord(job);

    $app.logger().info('Approved employer job', 'title', e.record.get('title'));
  } catch (err) {
    $app.logger().error('Failed to copy approved job', 'error', err);
  }
}, 'pending_jobs');

// ─── Send confirmation email when application received ──────────────────────
onRecordAfterCreateRequest((e) => {
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
      subject: `Application received — ${jobTitle}`,
      html: `<p>Hi ${name},</p>
<p>Thank you for applying for <strong>${jobTitle}</strong> via Edubuzz. Your application has been received and forwarded to the employer.</p>
<p>Good luck! The Edubuzz team.</p>
<p style="color:#888;font-size:12px">Edubuzz.co.za — Find jobs in South Africa</p>`,
    });
  } catch (err) {
    $app.logger().error('Failed to send application confirmation', 'error', err);
  }
}, 'applications');

// ─── Send job alert emails when new job is created ──────────────────────────
onRecordAfterCreateRequest((e) => {
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

onRecordBeforeCreateRequest((e) => {
  if (e.record.collection().name !== 'jobs') return;
  if (!e.record.get('expires')) {
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    e.record.set('expires', expires.toISOString());
  }
}, 'jobs');

onRecordBeforeUpdateRequest((e) => {
  if (e.record.collection().name !== 'jobs') return;
  const expires = e.record.get('expires');
  if (expires && new Date(expires).getTime() <= Date.now()) {
    e.record.set('active', false);
  }
}, 'jobs');
