import mock_backend
from fastapi.testclient import TestClient

client = TestClient(mock_backend.app)

# 1. Test Root
r = client.get('/')
assert r.status_code == 200, f'Root failed: {r.status_code}'

# 2. Test Stats
r = client.get('/api/dashboard/stats')
assert r.status_code == 200, f'Stats failed: {r.status_code}'
print('Dashboard stats:', r.json())

# 3. Test POST /api/complaints
new_complaint = {
    'complaint_text': 'Medicine is unavailable in ward 1',
    'language': 'en',
    'source': 'web'
}
r = client.post('/api/complaints', json=new_complaint)
assert r.status_code == 201, f'Create failed: {r.status_code}'
data = r.json()
created_id = data['id']
print('Created Complaint ID:', created_id)

# 4. Test GET /api/complaints/{id}
r = client.get(f'/api/complaints/{created_id}')
assert r.status_code == 200, f'Get by ID failed: {r.status_code}'
assert r.json()['id'] == created_id
print('Fetched Complaint successfully:', r.json()['complaint_text'])

# 5. Test PATCH /api/complaints/{id}/status
r = client.patch(f'/api/complaints/{created_id}/status', json={'status': 'Resolved'})
assert r.status_code == 200, f'Patch failed: {r.status_code}'
assert r.json()['status'] == 'Resolved'
print('Updated status successfully:', r.json()['status'])

# 6. Test GET /api/complaints
r = client.get('/api/complaints')
assert r.status_code == 200, f'Get all failed: {r.status_code}'
print('All complaints count:', len(r.json()))

print('ALL API CONTRACT CHECKS VERIFIED SUCCESSFULLY!')
