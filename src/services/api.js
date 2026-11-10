import axios from 'axios';

// When running via Vite dev server, empty baseURL lets Vite's proxy route /api to http://localhost:8000 without CORS issues.
// Can be overridden via VITE_API_BASE_URL if needed.
const API_BASE = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : (import.meta.env.DEV ? '' : 'http://localhost:8000');

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  /**
   * Health check to detect if FastAPI backend is reachable
   */
  async checkHealth() {
    try {
      const res = await client.get('/api/dashboard/stats', { timeout: 3000 });
      return { online: true, data: res.data };
    } catch (err) {
      try {
        const resRoot = await axios.get('http://localhost:8000/', { timeout: 3000 });
        return { online: true, data: resRoot.data };
      } catch (innerErr) {
        return { online: false, error: err.message };
      }
    }
  },

  /**
   * POST /api/complaints
   * Request:
   * {
   *   "complaint_text": "Medicine is unavailable",
   *   "language": "en",
   *   "source": "web"
   * }
   */
  async registerComplaint(complaintData) {
    const text = complaintData.complaint_text || complaintData.description || '';
    const payload = {
      description: text,
      complaint_text: text,
      patient_name: complaintData.patient_name || complaintData.citizen_name || 'Citizen',
      contact_number: complaintData.contact_number || complaintData.citizen_contact || null,
      category: complaintData.category || 'Other',
      department: complaintData.department || 'Hospital Administration',
      priority: 'Medium',
      language: complaintData.language || 'en',
      source: complaintData.source || 'web'
    };

    const response = await client.post('/api/complaints', payload);
    return response.data;
  },

  /**
   * GET /api/complaints/{complaint_id}
   */
  async getComplaint(complaintId) {
    const cleanId = encodeURIComponent(String(complaintId).trim());
    const response = await client.get(`/api/complaints/${cleanId}`);
    return response.data;
  },

  /**
   * GET /api/complaints
   */
  async getAllComplaints() {
    const response = await client.get('/api/complaints');
    return response.data;
  },

  /**
   * GET /api/dashboard/stats
   */
  async getDashboardStats() {
    const response = await client.get('/api/dashboard/stats');
    return response.data;
  },

  /**
   * PATCH /api/complaints/{complaint_id}/status
   */
  async updateComplaintStatus(complaintId, status, extra = {}) {
    const cleanId = encodeURIComponent(String(complaintId).trim());

    // Normalize status string to backend schema (Pending, In Progress, Resolved, Closed, Escalated)
    let mappedStatus = status;
    const sLower = String(status).toLowerCase();
    if (sLower.includes('submit') || sLower.includes('pend')) mappedStatus = 'Pending';
    else if (sLower.includes('progress')) mappedStatus = 'In Progress';
    else if (sLower.includes('resolve')) mappedStatus = 'Resolved';
    else if (sLower.includes('close') || sLower.includes('reject')) mappedStatus = 'Closed';

    const payload = {
      status: mappedStatus,
      changed_by: extra.changed_by || 'Hospital Staff',
      notes: extra.remarks || extra.notes || 'Status updated via Staff Portal',
      resolution_notes: mappedStatus === 'Resolved' || mappedStatus === 'Closed' ? (extra.remarks || 'Grievance redressed') : undefined
    };

    const response = await client.patch(`/api/complaints/${cleanId}/status`, payload);

    if (extra.department) {
      try {
        await client.patch(`/api/complaints/${cleanId}/assign`, {
          assigned_to: extra.assigned_to || 'Department Duty Officer',
          assigned_department: extra.department,
          notes: `Reassigned to ${extra.department}`
        });
      } catch (e) {
        // Optional if backend assign has separate authorization
      }
    }

    return response.data;
  }
};

export default api;
