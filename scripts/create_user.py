import urllib.request, json

# Auth as superuser
auth_data = json.dumps({'identity':'praiseleeto@gmail.com','password':'Mogaila1996!@#'}).encode()
req = urllib.request.Request('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', data=auth_data, headers={'Content-Type':'application/json'})
resp = urllib.request.urlopen(req)
token = json.loads(resp.read())['token']
print(f'Token: {token[:20]}...')

# Create admin user (ignore if already exists)
user_data = json.dumps({'email':'praiseleeto@gmail.com','password':'Mogaila1996!@#','passwordConfirm':'Mogaila1996!@#','name':'Emmanuel','role':'admin','emailVisibility':True,'verified':True}).encode()
req2 = urllib.request.Request('http://127.0.0.1:8090/api/collections/users/records', data=user_data, headers={'Content-Type':'application/json','Authorization': token})
try:
    resp2 = urllib.request.urlopen(req2)
    print(resp2.read().decode())
except urllib.error.HTTPError as e:
    print(f'Response: {e.code} {e.reason}')
    print(e.read().decode())
