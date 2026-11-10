import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { BackendStatusAlert } from '../components/BackendStatusAlert';
import { 
  LayoutDashboard, 
  Search, 
  Filter, 
  PhoneCall, 
  Globe, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Building, 
  Calendar, 
  RefreshCw, 
  ChevronRight, 
  Check, 
  FileText, 
  UserCheck,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { DEPARTMENT_MAPPING } from '../translations';

const STATUS_OPTIONS = ['Submitted', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

const DEPARTMENTS = [
  'Pharmacy & Medical Supplies',
  'Hospital Administration / Medical Superintendent',
  'Sanitation & Housekeeping Wing',
  'Hospital Infrastructure & Maintenance',
  'Emergency & Inpatient Admissions',
  'Public Relations & Patient Welfare Desk'
];

export const DashboardPage = () => {
  const { lang, t } = useLanguage();
  const { user, role } = useAuth();

  // Data state
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [myDeptOnly, setMyDeptOnly] = useState(false);

  // Detail & Status Edit Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newDept, setNewDept] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch complaints from GET /api/complaints
      // 2. Fetch stats from GET /api/dashboard/stats
      const [complaintsRes, statsRes] = await Promise.allSettled([
        api.getAllComplaints(),
        api.getDashboardStats()
      ]);

      let complaintsList = [];
      if (complaintsRes.status === 'fulfilled') {
        // Backend might return an array directly or { complaints: [...] }
        const data = complaintsRes.value;
        complaintsList = Array.isArray(data) ? data : (data.complaints || data.items || []);
        setComplaints(complaintsList);
      } else {
        console.warn('GET /api/complaints failed:', complaintsRes.reason);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      } else {
        // If stats endpoint fails or backend only has complaints list, compute stats from complaints list
        console.warn('GET /api/dashboard/stats failed or unconfigured, computing from complaints list:', statsRes.reason);
      }

      if (complaintsRes.status === 'rejected' && statsRes.status === 'rejected') {
        throw new Error(complaintsRes.reason?.message || 'Unable to connect to hospital backend server.');
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load hospital dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute live KPIs (falling back gracefully to real counts from complaint items if stats object wasn't supplied)
  const computedStats = useMemo(() => {
    if (stats && (stats.total !== undefined || stats.total_complaints !== undefined)) {
      return {
        total: stats.total ?? stats.total_complaints ?? 0,
        submitted: stats.submitted ?? stats.submitted_complaints ?? 0,
        pending: stats.pending ?? stats.pending_complaints ?? 0,
        inProgress: stats.in_progress ?? stats.inProgress ?? stats.in_progress_complaints ?? 0,
        resolved: stats.resolved ?? stats.resolved_complaints ?? 0
      };
    }

    // Derive strictly from complaints returned by GET /api/complaints
    const total = complaints.length;
    let submitted = 0;
    let pending = 0;
    let inProgress = 0;
    let resolved = 0;

    complaints.forEach((c) => {
      const s = String(c.status || '').toLowerCase();
      if (s.includes('submit')) submitted++;
      else if (s.includes('pend')) pending++;
      else if (s.includes('progress') || s.includes('under') || s.includes('review')) inProgress++;
      else if (s.includes('resolve') || s.includes('closed')) resolved++;
    });

    return { total, submitted, pending, inProgress, resolved };
  }, [stats, complaints]);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const idMatch = String(c.complaint_id || c.id || '').toLowerCase();
      const textMatch = String(c.complaint_text || c.description || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();

      const matchesSearch = !query || idMatch.includes(query) || textMatch.includes(query);

      const status = String(c.status || '').toLowerCase();
      const matchesStatus =
        statusFilter === 'ALL' ||
        status.includes(statusFilter.toLowerCase());

      const matchesCategory =
        categoryFilter === 'ALL' ||
        String(c.category || '').toLowerCase() === categoryFilter.toLowerCase();

      const source = String(c.source || '').toLowerCase();
      const matchesSource =
        sourceFilter === 'ALL' ||
        (sourceFilter === 'voice' && source.includes('voice')) ||
        (sourceFilter === 'web' && !source.includes('voice'));

      const matchesDept = !myDeptOnly || !user?.department ||
        String(c.department || '').toLowerCase().includes(user.department.toLowerCase().slice(0, 8));

      return matchesSearch && matchesStatus && matchesCategory && matchesSource && matchesDept;
    });
  }, [complaints, searchQuery, statusFilter, categoryFilter, sourceFilter, myDeptOnly, user]);

  // Handle open complaint detail drawer
  const handleOpenDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status || 'Submitted');
    setNewDept(complaint.department || DEPARTMENTS[0]);
    setStatusRemarks('');
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  // Submit PATCH /api/complaints/{complaint_id}/status
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    const cId = selectedComplaint.complaint_id || selectedComplaint.id;

    try {
      const officerRemark = user 
        ? `[Updated by ${user.name} (${user.roleLabel || user.role})]: ${statusRemarks || 'Status updated'}` 
        : statusRemarks;

      const extraPayload = {
        department: newDept,
        remarks: officerRemark
      };
      const res = await api.updateComplaintStatus(cId, newStatus, extraPayload);
      
      // Update in local state
      setComplaints((prev) =>
        prev.map((item) => {
          const itemId = item.complaint_id || item.id;
          if (itemId === cId) {
            return {
              ...item,
              status: newStatus,
              department: newDept,
              ...(res || {})
            };
          }
          return item;
        })
      );

      setUpdateSuccess(true);
      setTimeout(() => {
        setSelectedComplaint(null);
        setUpdateSuccess(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to update status:', err);
      setUpdateError(err.response?.data?.detail || err.message || 'Failed to update complaint status on backend.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white border border-[#dee1e6] px-3 py-1 rounded-full text-xs font-semibold text-[#0052ff] mb-2">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Official Hospital Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal text-[#0a0b0d] tracking-tight">
              {t('dashTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-[#5b616e] mt-1">
              {t('dashSubtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="btn-outline text-xs py-2 px-4 space-x-2 bg-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Authenticated Officer Session Card */}
        {user && (
          <div className="bg-white border border-[#dee1e6] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-[#0052ff]'
              }`}>
                {user.role === 'admin' ? <Building className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm text-[#0a0b0d]">
                    {lang === 'kn' ? (user.name_kn || user.name) : user.name}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                      : 'bg-blue-50 text-[#0052ff] border border-blue-200'
                  }`}>
                    {user.roleLabel || user.role}
                  </span>
                </div>
                <div className="text-xs text-[#5b616e] mt-0.5 flex flex-wrap items-center gap-x-2">
                  <span>{user.designation || user.department}</span>
                  {user.id && <span className="text-[#7c828a] font-mono text-[11px]">({user.id})</span>}
                </div>
              </div>
            </div>

            {/* If Staff: Filter My Department toggle */}
            {user.role === 'staff' && user.department && (
              <div className="flex items-center space-x-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setMyDeptOnly(!myDeptOnly)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    myDeptOnly
                      ? 'bg-[#0052ff] text-white border-[#0052ff] shadow-xs'
                      : 'bg-[#f7f7f7] text-[#0a0b0d] border-[#dee1e6] hover:bg-[#eef0f3]'
                  }`}
                >
                  {myDeptOnly ? '✓ Showing My Department' : 'Filter My Department Grievances'}
                </button>
              </div>
            )}

            {user.role === 'admin' && (
              <div className="text-xs text-purple-700 font-semibold bg-purple-50/70 border border-purple-200 px-3 py-1.5 rounded-full self-start sm:self-center">
                Full Administrative Rights Enabled
              </div>
            )}
          </div>
        )}

        {/* Backend Connection Error Alert */}
        {error && (
          <BackendStatusAlert onRetry={fetchDashboardData} isRetrying={loading} />
        )}

        {/* Module 4 Metric Cards: Total, Submitted, Pending, In-Progress, Resolved */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total */}
          <div className="bg-white border border-[#dee1e6] rounded-2xl p-5 shadow-xs">
            <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider block">
              {t('statTotal')}
            </span>
            <div className="text-3xl font-mono font-bold text-[#0a0b0d] mt-2">
              {computedStats.total}
            </div>
            <span className="text-[11px] text-[#5b616e] mt-1 block">
              All Channels
            </span>
          </div>

          {/* Submitted */}
          <div className="bg-white border border-[#dee1e6] rounded-2xl p-5 shadow-xs">
            <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider block">
              {t('statSubmitted')}
            </span>
            <div className="text-3xl font-mono font-bold text-[#0052ff] mt-2">
              {computedStats.submitted}
            </div>
            <span className="text-[11px] text-[#5b616e] mt-1 block">
              Awaiting First Review
            </span>
          </div>

          {/* Pending */}
          <div className="bg-white border border-[#dee1e6] rounded-2xl p-5 shadow-xs">
            <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider block">
              {t('statPending')}
            </span>
            <div className="text-3xl font-mono font-bold text-amber-600 mt-2">
              {computedStats.pending}
            </div>
            <span className="text-[11px] text-[#5b616e] mt-1 block">
              Needs Officer Action
            </span>
          </div>

          {/* In Progress */}
          <div className="bg-white border border-[#dee1e6] rounded-2xl p-5 shadow-xs">
            <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider block">
              {t('statInProgress')}
            </span>
            <div className="text-3xl font-mono font-bold text-indigo-600 mt-2">
              {computedStats.inProgress}
            </div>
            <span className="text-[11px] text-[#5b616e] mt-1 block">
              Under Active Resolution
            </span>
          </div>

          {/* Resolved */}
          <div className="bg-white border border-[#dee1e6] rounded-2xl p-5 shadow-xs col-span-2 lg:col-span-1">
            <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider block">
              {t('statResolved')}
            </span>
            <div className="text-3xl font-mono font-bold text-[#05b169] mt-2">
              {computedStats.resolved}
            </div>
            <span className="text-[11px] text-[#5b616e] mt-1 block">
              Redressed & Closed
            </span>
          </div>
        </div>

        {/* Complaints Table & Filters Section */}
        <div className="bg-white border border-[#dee1e6] rounded-3xl overflow-hidden shadow-xs">
          {/* Controls Bar */}
          <div className="p-5 border-b border-[#dee1e6] space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('dashSearchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#dee1e6] bg-white text-[#0a0b0d] text-xs focus:outline-none focus:border-[#0052ff]"
                />
                <Search className="w-4 h-4 text-[#7c828a] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-full border border-[#dee1e6] bg-white text-[#0a0b0d] focus:outline-none focus:border-[#0052ff] font-medium"
                >
                  <option value="ALL">{t('dashFilterStatus')}: {t('dashAll')}</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Pending">Pending</option>
                  <option value="Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                {/* Source Filter */}
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-3 py-2 rounded-full border border-[#dee1e6] bg-white text-[#0a0b0d] focus:outline-none focus:border-[#0052ff] font-medium"
                >
                  <option value="ALL">{t('dashFilterSource')}: {t('dashAll')}</option>
                  <option value="web">{t('dashSourceWeb')}</option>
                  <option value="voice">{t('dashSourceVoice')}</option>
                </select>

                {(searchQuery || statusFilter !== 'ALL' || sourceFilter !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                      setSourceFilter('ALL');
                    }}
                    className="px-3 py-2 text-xs text-[#0052ff] hover:underline"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f7f7f7] border-b border-[#dee1e6] text-[#7c828a] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 font-semibold">{t('dashColId')}</th>
                  <th className="py-3 px-4 font-semibold">{t('dashColIssue')}</th>
                  <th className="py-3 px-4 font-semibold">{t('dashColCategory')}</th>
                  <th className="py-3 px-4 font-semibold">{t('dashColDept')}</th>
                  <th className="py-3 px-4 font-semibold">{t('dashColSource')}</th>
                  <th className="py-3 px-4 font-semibold">{t('dashColDate')}</th>
                  <th className="py-3 px-4 font-semibold">{t('dashColStatus')}</th>
                  <th className="py-3 px-4 font-semibold text-right">{t('dashColAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee1e6]">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[#7c828a]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0052ff]" />
                      <span>Loading hospital grievance records from backend...</span>
                    </td>
                  </tr>
                ) : filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-[#7c828a] space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-[#a8acb3]" />
                      <div className="font-semibold text-sm text-[#0a0b0d]">{t('dashEmptyTitle')}</div>
                      <p className="text-xs text-[#5b616e] max-w-sm mx-auto">{t('dashEmptyDesc')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((item, index) => {
                    const cId = item.complaint_id || item.id || `CV-${index + 1}`;
                    const isVoice = String(item.source || '').toLowerCase().includes('voice');

                    return (
                      <tr 
                        key={cId || index} 
                        className="hover:bg-[#f7f7f7]/80 transition-colors cursor-pointer"
                        onClick={() => handleOpenDetail(item)}
                      >
                        {/* ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#0052ff]">
                          {cId}
                        </td>

                        {/* Text */}
                        <td className="py-3.5 px-4 max-w-xs truncate text-[#0a0b0d] font-medium" title={item.complaint_text}>
                          {item.complaint_text || item.description || 'No complaint text'}
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-[#5b616e]">
                          {item.category || 'General'}
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4 text-[#5b616e]">
                          {item.department || 'Administration'}
                        </td>

                        {/* Registration Source: Web or Voice Call */}
                        <td className="py-3.5 px-4">
                          {isVoice ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <PhoneCall className="w-3 h-3 mr-1" />
                              Voice call
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <Globe className="w-3 h-3 mr-1" />
                              Web
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-[#7c828a] whitespace-nowrap">
                          {item.created_at || item.date 
                            ? new Date(item.created_at || item.date).toLocaleDateString()
                            : 'Today'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={item.status || 'Submitted'} />
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDetail(item);
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#eef0f3] hover:bg-[#0052ff] hover:text-white transition-colors"
                          >
                            <span>{t('dashBtnUpdate')}</span>
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer of table */}
          <div className="p-4 bg-[#f7f7f7] border-t border-[#dee1e6] flex items-center justify-between text-xs text-[#7c828a]">
            <span>Showing {filteredComplaints.length} of {complaints.length} grievances</span>
            <span className="font-mono text-[11px]">CareVoice Redressal Portal v1.0</span>
          </div>
        </div>
      </div>

      {/* Staff Update & Detail Drawer / Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#dee1e6] shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="p-6 border-b border-[#dee1e6] flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-[#7c828a] tracking-wider block">
                  {t('dashModalTitle')}
                </span>
                <div className="text-lg font-mono font-bold text-[#0a0b0d] mt-0.5">
                  {selectedComplaint.complaint_id || selectedComplaint.id}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-2 rounded-full text-[#7c828a] hover:text-[#0a0b0d] hover:bg-[#f7f7f7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error or Success notification */}
            {updateError && (
              <div className="m-6 mb-0 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{updateError}</span>
              </div>
            )}
            {updateSuccess && (
              <div className="m-6 mb-0 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Status successfully updated on hospital server!</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleStatusUpdate} className="p-6 space-y-5 text-xs">
              {/* Grievance Text Display */}
              <div className="bg-[#f7f7f7] border border-[#dee1e6] rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-[#7c828a]">
                  <span>Channel: {selectedComplaint.source || 'Web'}</span>
                  <span>Category: {selectedComplaint.category || 'General'}</span>
                </div>
                <p className="text-[#0a0b0d] text-xs sm:text-sm font-medium leading-relaxed">
                  "{selectedComplaint.complaint_text || selectedComplaint.description}"
                </p>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#0a0b0d] uppercase tracking-wider">
                  {t('dashModalSelectStatus')}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#dee1e6] bg-white text-[#0a0b0d] font-semibold text-xs focus:outline-none focus:border-[#0052ff]"
                  required
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Reassignment */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#0a0b0d] uppercase tracking-wider">
                  {t('dashModalSelectDept')}
                </label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#dee1e6] bg-white text-[#0a0b0d] font-medium text-xs focus:outline-none focus:border-[#0052ff]"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-[#0a0b0d] uppercase tracking-wider">
                  {t('dashModalRemarks')}
                </label>
                <textarea
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder={t('dashModalRemarksPlaceholder')}
                  className="w-full p-3 rounded-xl border border-[#dee1e6] bg-white text-[#0a0b0d] text-xs focus:outline-none focus:border-[#0052ff]"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#dee1e6] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  disabled={isUpdating}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#5b616e] hover:bg-[#eef0f3]"
                >
                  {t('btnCancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary py-2.5 px-6 text-xs shadow-xs"
                >
                  {isUpdating ? t('btnSavingStatus') : t('btnSaveStatus')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

