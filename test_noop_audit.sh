#!/bin/bash
set -e

cd /home/edubuzz/pocketbase/pb_hooks

# Backup the original
cp main.pb.js main.pb.js.bak

# Replace auditLog with no-op
python3 -c "
import re
with open('main.pb.js', 'r') as f:
    content = f.read()

# Replace the auditLog function body with a no-op
old = '''function auditLog(event, details) {
  try {
    const auditCol = \$app.dao().findCollectionByNameOrId('audit_logs');
    const log = new Record(auditCol);
    log.set('event', event);
    log.set('details', JSON.stringify(details));
    log.set('created', new Date().toISOString());
    \$app.dao().saveRecord(log);
  } catch {
    // Audit collection may not exist yet — skip silently
  }
}'''

new = '''function auditLog(event, details) {
  // no-op for testing
  \$app.logger().info('[auditLog test]', 'event', event, 'collection', details?.collection);
}'''

content = content.replace(old, new)

with open('main.pb.js', 'w') as f:
    f.write(content)

print('auditLog replaced with no-op')
"

systemctl restart pocketbase
sleep 2
echo "PB restarted"
