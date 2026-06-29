import urllib.request, re, http.cookiejar, urllib.parse, json

BASE = 'http://127.0.0.1:4321'
headers = {
    'Accept': 'application/json',
    'Origin': BASE,
    'Host': '127.0.0.1:4321',
    'Content-Type': 'application/x-www-form-urlencoded',
}

cj = http.cookiejar.CookieJar()
o = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Get login page + CSRF
r = o.open(urllib.request.Request(f'{BASE}/login', headers={'Origin': BASE, 'Host': '127.0.0.1:4321'}))
html = r.read().decode()
csrf = re.search(r'name="_csrf"[^>]*value="([^"]+)"', html)
csrftok = csrf.group(1) if csrf else ''
print(f'CSRF: {csrftok[:30]}...')

# 2. Login
data = urllib.parse.urlencode({
    'email': 'praiseleeto@gmail.com',
    'password': 'Mogaila1996!@#',
    '_csrf': csrftok,
}).encode()
req = urllib.request.Request(f'{BASE}/api/auth/login', data=data, headers=headers)
try:
    r2 = o.open(req)
    print(f'Status: {r2.status}')
    print(f'Body: {r2.read().decode()[:500]}')
    # Check cookies
    for c in cj:
        print(f'Cookie: {c.name} = {c.value[:30]}... domain={c.domain}')
except urllib.error.HTTPError as e:
    print(f'Error: {e.code}')
    try:
        print(f'Body: {e.read().decode()[:500]}')
    except:
        pass
    print(f'Headers: {dict(e.headers)[:5]}')

# 3. Test PocketBase direct auth
d = json.dumps({'identity':'praiseleeto@gmail.com','password':'Mogaila1996!@#'}).encode()
r3 = urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8090/api/collections/users/auth-with-password', data=d, headers={'Content-Type':'application/json'}))
print(f'\nPB users auth: {r3.status} {r3.read().decode()[:500]}')

# 4. Test _superusers auth
d2 = json.dumps({'identity':'praiseleeto@gmail.com','password':'Mogaila1996!@#'}).encode()
r4 = urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', data=d2, headers={'Content-Type':'application/json'}))
print(f'\nPB superuser auth: {r4.status} {r4.read().decode()[:200]}')

# 5. Check PM2 env vars
import subprocess
result = subprocess.run(['systemctl', 'status', 'pocketbase'], capture_output=True, text=True)
print(f'\nPocketBase status: {result.stdout[:200]}')
