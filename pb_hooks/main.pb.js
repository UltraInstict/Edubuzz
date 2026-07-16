/// <reference path="../pb_data/types.d.ts" />
//
// Edubuzz PocketBase hooks — PocketBase v0.23+ / v0.37 JSVM API.
//
// IMPORTANT (v0.23+ semantics):
//   * DAO methods moved onto $app directly ($app.findFirstRecordByFilter,
//     $app.findCollectionByNameOrId, $app.save, $app.findRecordsByFilter, ...).
//     The old $app.dao() no longer exists.
//   * Every record hook MUST call e.next() to continue the execution chain and
//     actually persist the record. Omitting it silently blocks the operation.
//
// These hooks are intentionally defensive: they only fill values that are
// missing (slug/expiry) so callers that already set them — the import pipeline
// and employer save-job — are never overridden.

// ─── Auto-slug + default expiry on job create ───────────────────────────────
onRecordCreate((e) => {
  const r = e.record;

  if (!r.get('slug')) {
    const title = (r.get('title') || '').toString();
    let base = title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'job';
    let unique = base;
    let i = 1;
    while (i < 1000) {
      try {
        $app.findFirstRecordByFilter('jobs', 'slug = {:s}', { s: unique });
        unique = `${base}-${i++}`; // taken → try next
      } catch (_) {
        break; // not found → unique
      }
    }
    r.set('slug', unique);
  }

  const curExp = r.get('expires');
  if (!curExp || String(curExp) === '') {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    // PocketBase datetime canonical format: "2006-01-02 15:04:05.000Z"
    r.set('expires', d.toISOString().replace('T', ' '));
  }

  e.next();
}, 'jobs');

// ─── Auto-deactivate expired jobs on update ─────────────────────────────────
onRecordUpdate((e) => {
  const exp = e.record.get('expires');
  if (exp && new Date(exp).getTime() <= Date.now()) {
    e.record.set('active', false);
  }
  e.next();
}, 'jobs');

// ─── Auto-approve pending jobs → copy to live jobs ──────────────────────────
onRecordAfterUpdateSuccess((e) => {
  try {
    const r = e.record;
    if (r.get('status') === 'approved') {
      const col = $app.findCollectionByNameOrId('jobs');
      const job = new Record(col);
      job.set('title', r.get('title'));
      job.set('company', r.get('company'));
      job.set('category', r.get('category') || '');
      job.set('description', r.get('description'));
      job.set('province', r.get('province'));
      job.set('city', r.get('city') || '');
      job.set('job_type', r.get('job_type'));
      job.set('salary_min', r.get('salary_min'));
      job.set('salary_max', r.get('salary_max'));
      job.set('apply_url', r.get('apply_url') || '');
      job.set('apply_email', r.get('apply_email') || '');
      job.set('source', 'employer');
      job.set('active', true);
      job.set('featured', false);
      $app.save(job);
      $app.logger().info('Approved employer job', 'title', r.get('title'));
    }
  } catch (err) {
    $app.logger().error('Failed to copy approved job', 'error', String(err));
  }
  e.next();
}, 'pending_jobs');

// ─── Job expiry reminder (daily 09:00 SAST = 07:00 UTC) ─────────────────────
// Registration is wrapped so an API mismatch can never break hook loading.
try {
  cronAdd('send-expiry-reminders', '0 7 * * *', () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const in3 = new Date();
      in3.setDate(in3.getDate() + 3);
      const in3Str = in3.toISOString().slice(0, 10);

      const jobs = $app.findRecordsByFilter(
        'jobs',
        `active = true && expires >= "${today}" && expires <= "${in3Str}"`,
        'expires',
        100,
        0
      );

      for (const job of jobs) {
        const employerId = job.get('employer_id');
        if (!employerId) continue;
        try {
          const employer = $app.findRecordById('employers', employerId);
          const email = employer.get('contact_email');
          if (!email || email === 'no-reply@edubuzz.local') continue;

          const slug = job.get('slug');
          const title = job.get('title');
          const company = job.get('company');
          const message = new MailerMessage({
            from: { address: $app.settings().smtp.senderAddress || 'no-reply@edubuzz.co.za', name: 'Edubuzz' },
            to: [{ address: email }],
            subject: `Your listing "${title}" expires soon — renew now`,
            html: `<p>Hi there,</p><p>Your job listing for <strong>${title}</strong> at ${company} expires soon.</p><p><a href="https://edubuzz.co.za/employer/upgrade">Renew or upgrade</a> &middot; <a href="https://edubuzz.co.za/job/${slug}">View listing</a></p>`,
          });
          $app.newMailClient().send(message);
          $app.logger().info('Sent expiry reminder', 'job', slug);
        } catch (err) {
          $app.logger().error('expiry reminder failed', 'error', String(err));
        }
      }
    } catch (err) {
      $app.logger().error('Expiry reminder cron failed', 'error', String(err));
    }
  });
} catch (err) {
  $app.logger().error('Failed to register expiry cron', 'error', String(err));
}
