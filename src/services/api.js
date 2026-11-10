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
    // Only send the exact fields required by the API contract
    const payload = {
      complaint_text: complaintData.complaint_text,
      language: complaintData.language || 'en',
      source: complaintData.source || 'web'
    };

    // If backend optionally accepts category or department, include if provided
    if (complaintData.category) {
      payload.category = complaintData.category;
    }
    if (complaintData.department) {
      payload.department = complaintData.department;
    }

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
    const payload = {
      status,
      ...extra
    };
    const response = await client.patch(`/api/complaints/${cleanId}/status`, payload);
    return response.data;
  }
};

export default api;
