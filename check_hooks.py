#!/usr/bin/env python3
import re
with open('/home/edubuzz/pocketbase/pb_hooks/main.pb.js', 'r', encoding='utf-8') as f:
    content = f.read()

on_create = len(re.findall(r'onRecordCreate\(', content))
on_update = len(re.findall(r'onRecordUpdate\(', content))
on_after_create = len(re.findall(r'onRecordAfterCreateSuccess\(', content))
on_after_update = len(re.findall(r'onRecordAfterUpdateSuccess\(', content))
on_after_delete = len(re.findall(r'onRecordAfterDeleteSuccess\(', content))
cron_count = content.count('$app.cron()')
has_module = 'module.exports' in content
has_seed = 'SEED_CATEGORIES' in content

print(f'onRecordCreate={on_create}')
print(f'onRecordUpdate={on_update}')
print(f'onRecordAfterCreateSuccess={on_after_create}')
print(f'onRecordAfterUpdateSuccess={on_after_update}')
print(f'onRecordAfterDeleteSuccess={on_after_delete}')
print(f'cron={cron_count}')
print(f'module.exports={has_module}')
print(f'SEED data={has_seed}')
print(f'Total lines={content.count(chr(10))+1}')
