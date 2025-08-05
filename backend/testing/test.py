import requests

# 1. Get AAD token
token_url = f"https://login.microsoftonline.com/0ae51e19-07c8-4e4b-bb6d-648ee58410f4/oauth2/v2.0/token"
data = {
    'grant_type': 'client_credentials',
    'client_id': 'ab457895-1c2a-4f05-a5ae-c1637b2c63b6',
    'client_secret': '7KI8Q~A4.jHGoPvbAkuu4YJo1FdlqeYDMmrp9cZz',
    'scope': 'https://analysis.windows.net/powerbi/api/.default'
}
token = requests.post(token_url, data=data, verify=False).json()["access_token"]

print(token)


#%%
# 2. List reports
headers = {'Authorization': f'Bearer {token}'}
groups_resp = requests.get("https://api.powerbi.com/v1.0/myorg/groups", headers=headers)
groups = groups_resp.json().get("value", [])

for group in groups:
    group_id = group['id']
    group_name = group['name']
    print(f"Workspace: {group_name} (ID: {group_id})")
    # Step 3: List all reports in this workspace
    reports_url = f"https://api.powerbi.com/v1.0/myorg/groups/{group_id}/reports"
    reports_resp = requests.get(reports_url, headers=headers)
    reports = reports_resp.json().get("value", [])
    for report in reports:
        report_name = report['name']
        report_id = report['id']
        embed_url = report['embedUrl']
        print(f"  Report: {report_name}")
        print(f"    Report ID: {report_id}")
        print(f"    Embed URL: {embed_url}\n")# %%
