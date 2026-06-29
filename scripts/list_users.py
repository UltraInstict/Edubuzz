import urllib.request, json

# Auth
d = json.dumps({'identity':'praiseleeto@gmail.com','password':'Mogaila1996!@#'}).encode()
r = urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', data=d, headers={'Content-Type':'application/json'}))
token = json.loads(r.read())['token']

# List collections
r2 = urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8090/api/collections', headers={'Authorization': token}))
cols = json.loads(r2.read())
for c in cols.get('items',[]):
    print(f"{c['name']} ({c['type']})")

# Check users
r3 = urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8090/api/collections/users/records', headers={'Authorization': token}))
users = json.loads(r3.read())
for u in users.get('items',[]):
    print(f"User: {u['email']} role={u.get('role','?')} verified={u.get('verified','?')}")

# Check employers
r4 = urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8090/api/collections/employers/records', headers={'Authorization': token}))
emps = json.loads(r4.read())
for e in emps.get('items',[]):
    print(f"Employer: {e.get('company_name','?')} user_id={e.get('user_id','?')}")
print(f"Total employers: {emps.get('totalItems',0)}")
