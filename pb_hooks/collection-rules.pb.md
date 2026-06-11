# PocketBase Collection Access Rules
# Apply these rules through the PocketBase Admin UI or via migration

## users collection
### List/Search Rule
```
@request.auth.id != ""
```
### View Rule
```
id = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "superadmin"
```
### Create Rule (public registration)
```
@request.data.role = "employer"
```
### Update Rule
```
id = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "superadmin"
```
### Delete Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
### Field-level rules (via API rules):
- `role` field: only admin/superadmin can write; default "employer"
- `blocked` field: only admin/superadmin can write
- `suspended` field: only admin/superadmin can write
- `password` field: min 10 chars, must contain upper+lower+digit+special

## employers collection
### List/Search Rule
```
verified = true || @request.auth.role = "admin" || @request.auth.role = "superadmin" || @request.auth.role = "moderator"
```
(Public can only see verified employers; admins can see all)
### View Rule
```
verified = true || user_id = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "superadmin" || @request.auth.role = "moderator"
```
### Create Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
(Created via register API, which uses admin auth)
### Update Rule
```
user_id = @request.auth.id || @request.auth.role = "admin" || @request.auth.role = "superadmin"
```
(Employers can update their own; admins can moderate)
### Delete Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```

## jobs collection
### List/Search Rule
```
active = true && expires > @now
```
(Public only sees active non-expired jobs)
### View Rule
```
active = true || @request.auth.role = "admin" || @request.auth.role = "superadmin" || @request.auth.role = "moderator" || @request.auth.role = "employer"
```
### Create Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin" || @request.auth.role = "employer"
```
### Update Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin" || (@request.auth.role = "employer" && employer_id = @request.auth.employer_id)
```
### Delete Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
### Field-level rules (via API rules):
- `featured` field: only admin/superadmin can set
- `active` field: only admin/superadmin can toggle
- `xml_export` field: only admin/superadmin can set

## applications collection
### List/Search Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin" || @request.auth.role = "moderator" || @request.auth.role = "employer"
```
### View Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin" || @request.auth.role = "moderator"
```
(Admins can see all applications; employer view handled by application-specific queries)
### Create Rule (public — job applicants)
```
```
(Empty = anyone can create; authenticated check handled by API CSRF)
### Update Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin" || @request.auth.role = "moderator"
```
### Delete Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```

## categories collection
### List/Search Rule
```
```
(Public read-only)
### View Rule
```
```
### Create/Update/Delete Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```

## job_alerts collection
### List/Search Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
(Private — only admins see alerts list)
### View Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
### Create Rule (public)
```
```
(Create handled by API with CSRF)
### Delete Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```

## analytics_events collection
### List/Search Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
### View Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
### Create Rule (public — tracking)
```
```
### Update/Delete Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```

## pending_jobs collection
### List/Search Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin" || @request.auth.role = "moderator"
```
### View Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin" || @request.auth.role = "moderator"
```
### Create Rule (public — job posters)
```
```
(Create handled by API with CSRF)
### Update/Delete Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```

## audit_logs collection (new — to be created)
### List/Search Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
### View Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
### Create Rule
```
@request.auth.role = "admin" || @request.auth.role = "superadmin"
```
(Only internal — created by server-side hooks)
### Update/Delete Rule — none
```
@request.auth.id = ""
```
(No one can modify or delete audit logs)
