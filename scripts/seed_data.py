import urllib.request, json, sys

BASE = 'http://127.0.0.1:8090'
EMAIL = 'praiseleeto@gmail.com'
PASSWORD = 'Mogaila1996!@#'

def api(method, path, data=None, auth=True):
    headers = {'Content-Type': 'application/json'}
    if auth:
        ad = json.dumps({'identity':EMAIL,'password':PASSWORD}).encode()
        r = urllib.request.urlopen(urllib.request.Request(f'{BASE}/api/collections/_superusers/auth-with-password', data=ad, headers=headers))
        token = json.loads(r.read())['token']
        headers['Authorization'] = token
    if data:
        data = json.dumps(data).encode()
    r = urllib.request.urlopen(urllib.request.Request(f'{BASE}{path}', data=data, headers=headers))
    if r.status < 300:
        return json.loads(r.read())
    else:
        print(f'Error: {r.status} {r.read().decode()[:300]}')
        return None

# Seed categories
categories = [
    'Government','Health & Medical','IT & Technology','Engineering',
    'Finance & Accounting','Education & Teaching','Retail & Sales',
    'Logistics & Transport','Human Resources','Administration',
    'Marketing & Media','Hospitality & Tourism','Cleaning & Facilities',
    'Security','Legal',
]

print('=== Seeding categories ===')
for cat in categories:
    slug = cat.lower().replace(' & ','-').replace(' ','-')
    try:
        api(False,'/api/collections/categories/records', {'name':cat,'slug':slug}, auth=True)
        print(f'  Created: {cat}')
    except Exception as e:
        print(f'  Skip (exists?): {cat} - {e}')

# Seed jobs
jobs_seed = [
    {'title':'Administrative Officer','company':'Department of Health','category':'Administration','province':'Gauteng','city':'Pretoria','description':'Provide administrative support to the health department. Manage records, coordinate meetings, and handle correspondence. Grade 12 with 2 years admin experience required.','job_type':'Full-time','active':True},
    {'title':'Data Analyst','company':'Nedbank','category':'IT & Technology','province':'Gauteng','city':'Johannesburg','description':'Analyse financial data and create reports for business decision-making. SQL, Python, and Power BI experience required. 3-year degree in data science or related field.','job_type':'Full-time','active':True},
    {'title':'Registered Nurse','company':'Netcare Group','category':'Health & Medical','province':'Western Cape','city':'Cape Town','description':'Provide quality patient care in a hospital setting. Must be registered with SANC. Minimum 2 years clinical experience in a medical ward.','job_type':'Full-time','active':True},
    {'title':'IT Support Technician','company':'Shoprite','category':'IT & Technology','province':'Western Cape','city':'Cape Town','description':'Provide first-line IT support to retail stores across the Western Cape. Troubleshoot POS systems, network issues, and desktop support. CompTIA A+ required.','job_type':'Full-time','active':True},
    {'title':'Financial Accountant','company':'Standard Bank','category':'Finance & Accounting','province':'Gauteng','city':'Johannesburg','description':'Prepare financial statements, manage reconciliations, and support audit processes. CA(SA) or CIMA qualification preferred. 3-5 years experience in financial services.','job_type':'Full-time','active':True},
    {'title':'Sales Representative','company':'Pick n Pay','category':'Retail & Sales','province':'KwaZulu-Natal','city':'Durban','description':'Drive sales growth in the Durban region. Build relationships with key clients and identify new business opportunities. Previous FMCG sales experience advantageous.','job_type':'Full-time','active':True},
    {'title':'HR Officer','company':'Transnet','category':'Human Resources','province':'Eastern Cape','city':'Port Elizabeth','description':'Support the HR department with recruitment, onboarding, and employee relations. Degree in HR Management and 2 years experience in an industrial environment.','job_type':'Full-time','active':True},
    {'title':'Logistics Coordinator','company':'City of Johannesburg','category':'Logistics & Transport','province':'Gauteng','city':'Johannesburg','description':'Coordinate fleet operations and route planning for municipal services. Diploma in Logistics or Supply Chain Management. Valid Code 10 driver\'s licence.','job_type':'Full-time','active':True},
    {'title':'Teacher (Grade 7-9)','company':'Department of Education','category':'Education & Teaching','province':'Limpopo','city':'Polokwane','description':'Teach English and Social Sciences to Grade 7-9 learners at a public school. B.Ed or PGCE qualification. Must be registered with SACE.','job_type':'Full-time','active':True},
    {'title':'Security Officer','company':'SAPS','category':'Security','province':'Eastern Cape','city':'East London','description':'Patrol designated areas, monitor CCTV systems, and respond to incidents. PSIRA Grade C certification required. Must be physically fit and have no criminal record.','job_type':'Full-time','active':True},
]

print('\n=== Seeding jobs ===')
authd = json.dumps({'identity':EMAIL,'password':PASSWORD}).encode()
r = urllib.request.urlopen(urllib.request.Request(f'{BASE}/api/collections/_superusers/auth-with-password', data=authd, headers={'Content-Type':'application/json'}))
token = json.loads(r.read())['token']

for jd in jobs_seed:
    try:
        data = json.dumps(jd).encode()
        req = urllib.request.Request(f'{BASE}/api/collections/jobs/records', data=data, headers={'Content-Type':'application/json','Authorization':token})
        resp = urllib.request.urlopen(req)
        result = json.loads(resp.read())
        print(f'  Created: {jd["title"]} at {jd["company"]} ({result.get("slug","?")})')
    except Exception as e:
        print(f'  Error: {jd["title"]} - {e}')

print('\n=== Done ===')
print('Run py check_seed.py to verify counts')
