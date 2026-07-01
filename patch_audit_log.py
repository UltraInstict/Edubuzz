#!/usr/bin/env python3
"""Replace auditLog function body with no-op on the server."""
import sys

# Read main.pb.js
with open('main.pb.js', 'r') as f:
    content = f.read()

old_audit = '''function auditLog(event, details) {
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

new_audit = '''function auditLog(event, details) {
  $app.logger().info('[auditLog]', 'event', event, 'details', JSON.stringify(details));
}'''

if old_audit in content:
    content = content.replace(old_audit, new_audit)
    with open('main.pb.js', 'w') as f:
        f.write(content)
    print("Patched auditLog to no-op")
else:
    print("ERROR: Could not find auditLog function text to replace")
    sys.exit(1)
