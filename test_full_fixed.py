#!/usr/bin/env python3
"""Apply all PB v0.37 fixes to main.pb.js."""
with open('main.pb.js', 'r') as f:
    content = f.read()

changes = 0

# Fix 1: auditLog - new Record -> createRecord, saveRecord -> save
old1 = 'function auditLog(event, details) {\n  try {\n    const auditCol = $app.dao().findCollectionByNameOrId(\'audit_logs\');\n    const log = new Record(auditCol);\n    log.set(\'event\', event);\n    log.set(\'details\', JSON.stringify(details));\n    log.set(\'created\', new Date().toISOString());\n    $app.dao().saveRecord(log);\n  } catch {\n    // Audit collection may not exist yet — skip silently\n  }\n}'
new1 = 'function auditLog(event, details) {\n  try {\n    const auditCol = $app.dao().findCollectionByNameOrId(\'audit_logs\');\n    const log = $app.dao().createRecord(auditCol);\n    log.set(\'event\', event);\n    log.set(\'details\', JSON.stringify(details));\n    $app.dao().save(log);\n  } catch {\n    // Audit collection may not exist yet — skip silently\n  }\n}'

if old1 in content:
    content = content.replace(old1, new1)
    changes += 1
    print("Fix 1 applied: auditLog")
else:
    print("Fix 1 NOT applied: auditLog pattern not found")

# Fix 2: pending_jobs hook - new Record(jobsCol) -> createRecord(jobsCol)
old2 = '$app.dao().findCollectionByNameOrId(\'jobs\');\n    const job = new Record(jobsCol);'
new2 = '$app.dao().findCollectionByNameOrId(\'jobs\');\n    const job = $app.dao().createRecord(jobsCol);'
if old2 in content:
    content = content.replace(old2, new2)
    changes += 1
    print("Fix 2 applied: pending_jobs createRecord")
else:
    print("Fix 2 NOT applied: pending_jobs pattern not found")

# Fix 3: pending_jobs hook - saveRecord(job) -> save(job)
old3 = '$app.dao().saveRecord(job);'
new3 = '$app.dao().save(job);'
if old3 in content:
    content = content.replace(old3, new3)
    changes += 1
    print("Fix 3 applied: pending_jobs save")
else:
    print("Fix 3 NOT applied: pending_jobs save not found")

print(f"\nTotal changes: {changes}")

with open('main.pb.js', 'w') as f:
    f.write(content)
