#!/usr/bin/env python3
"""Apply all PB v0.37 fixes to main.pb.js."""
with open('main_pb_original.js', 'r', encoding='utf-8') as f:
    content = f.read()

changes = 0

# Fix 1: auditLog
old1 = '''function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    const log = new Record(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    log.set('created', new Date().toISOString());
    $app.dao().saveRecord(log);
  } catch {
    // Audit collection may not exist yet \u2014 skip silently
  }
}'''

new1 = '''function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    const log = $app.dao().createRecord(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    $app.dao().save(log);
  } catch {
    // Audit collection may not exist yet -- skip silently
  }
}'''

if old1 in content:
    content = content.replace(old1, new1)
    changes += 1
    print("Fix 1 applied: auditLog")
else:
    print("Fix 1 FAILED: auditLog pattern not found")

# Fix 2: pending_jobs new Record
old2 = '''    const jobsCol = $app.dao().findCollectionByNameOrId('jobs');
    const job = new Record(jobsCol);'''
new2 = '''    const jobsCol = $app.dao().findCollectionByNameOrId('jobs');
    const job = $app.dao().createRecord(jobsCol);'''
if old2 in content:
    content = content.replace(old2, new2)
    changes += 1
    print("Fix 2 applied: pending_jobs createRecord")
else:
    print("Fix 2 FAILED: pending_jobs new Record not found")

# Fix 3: pending_jobs saveRecord
old3 = '    $app.dao().saveRecord(job);'
new3 = '    $app.dao().save(job);'
if old3 in content:
    content = content.replace(old3, new3)
    changes += 1
    print("Fix 3 applied: pending_jobs save")
else:
    print("Fix 3 FAILED: pending_jobs saveRecord not found")

print(f"\nTotal changes: {changes}")

with open('main_pb_fixed.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify no deprecated APIs remain
if 'new Record(' in content:
    print("WARNING: 'new Record(' still found!")
if 'saveRecord(' in content:
    print("WARNING: 'saveRecord(' still found!")
