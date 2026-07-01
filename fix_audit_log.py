#!/usr/bin/env python3
"""Fix the auditLog function in main.pb.js for PB v0.37 API."""
import sys

with open('main.pb.js', 'r') as f:
    content = f.read()

old = '''function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    const log = new Record(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    log.set('created', new Date().toISOString());
    $app.dao().saveRecord(log);
  } catch {
    // Audit collection may not exist yet — skip silently
  }
}'''

new = '''function auditLog(event, details) {
  try {
    const auditCol = $app.dao().findCollectionByNameOrId('audit_logs');
    const log = $app.dao().createRecord(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    $app.dao().save(log);
  } catch {
    // Audit collection may not exist yet — skip silently
  }
}'''

if old in content:
    content = content.replace(old, new)
    with open('main.pb.js', 'w') as f:
        f.write(content)
    print("Fixed auditLog: new Record -> createRecord, saveRecord -> save")
elif new in content:
    print("Already fixed!")
else:
    print("ERROR: Could not find auditLog function text to replace")
    print("Looking for substring...")
    if 'function auditLog' in content:
        print("Found 'function auditLog'")
    if 'saveRecord' in content:
        print("Found 'saveRecord' - needs fixing")
