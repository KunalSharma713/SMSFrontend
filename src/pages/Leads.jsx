import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../context/ConfirmationContext';
import { LEAD_STATUS_OPTIONS, getLeadStatusLabel } from '../constants/leadStatus';
import Dropdown from '../components/Dropdown';
import DataTable from '../components/DataTable';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

export default function Leads() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useNotification();
  const { confirmDialog } = useConfirmation();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const canEdit = user?.role === 'ADMIN' || user?.role === 'ADVISOR';

  const fetchLeads = async () => {
    try {
      const params = { page, limit };
      if (filterStatus) params.status = filterStatus;
      const res = await axiosInstance.get('/leads', { params });
      setLeads(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLeads();
  }, [filterStatus, page]);

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Delete lead',
      message: 'Delete this lead? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    try {
      await axiosInstance.delete(`/leads/${id}`);
      fetchLeads();
      toast.success('Lead deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner" aria-hidden />
        <span style={{ marginLeft: '0.75rem' }}>Loading leads…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-alert app-alert-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-heading">Leads</h1>
        <div className="page-actions">
          <Dropdown
            variant="filter"
            fullWidth={false}
            placeholder="All statuses"
            ariaLabel="Filter by status"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            options={LEAD_STATUS_OPTIONS.map((s) => ({ value: s, label: getLeadStatusLabel(s) }))}
          />
        </div>
      </header>

      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable
          rows={leads}
          getRowKey={(lead) => lead._id}
          pagination={{ page, limit, total, onPageChange: setPage }}
          empty={{
            message: 'No leads found.',
            description: 'Try adjusting the status filter or add leads from the inquiry form.'
          }}
          columns={[
            {
              key: 'name',
              header: 'Name',
              cell: (lead) => `${lead.firstName} ${lead.lastName}`
            },
            {
              key: 'email',
              header: 'Email',
              cell: (lead) => lead.email
            },
            {
              key: 'phone',
              header: 'Phone',
              cell: (lead) => lead.phone || '—'
            },
            {
              key: 'program',
              header: 'Program',
              cell: (lead) => lead.interestedProgram?.name || '—'
            },
            {
              key: 'status',
              header: 'Status',
              cell: (lead) => (
                <span className={`badge badge-${lead.status === 'ENROLLED' ? 'enrolled' : lead.status === 'LOST' ? 'lost' : 'new'}`}>
                  {getLeadStatusLabel(lead.status)}
                </span>
              )
            },
            {
              key: 'advisor',
              header: 'Advisor',
              cell: (lead) => (
                lead.assignedAdvisor ? (
                  (lead.assignedAdvisor.name || '—')
                ) : user?.role === 'ADMIN' && lead.status !== 'ENROLLED' ? (
                  <button type="button" className="btn btn-ghost-app" onClick={() => navigate(`/leads/${lead._id}`, { state: { mode: 'assign' } })}>
                    <PersonAddAltOutlinedIcon fontSize="small" />
                    Assign
                  </button>
                ) : (
                  '—'
                )
              )
            },
            ...(canEdit ? [{
              key: 'actions',
              header: 'Actions',
              cell: (lead) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-ghost-app" 
                    onClick={() => navigate(`/leads/${lead._id}`, { state: { mode: 'view' } })}
                    aria-label="View lead details"
                    title="View"
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </button>
                  {user?.role === 'ADMIN' ? (
                    lead.status === 'ENROLLED' ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>
                    ) : (
                      <button type="button" className="btn btn-danger-app" onClick={() => handleDelete(lead._id)} aria-label="Delete lead" title="Delete">
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </button>
                    )
                  ) : lead.status === 'ENROLLED' ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>
                  ) : (
                    <button type="button" className="btn btn-ghost-app" onClick={() => navigate(`/leads/${lead._id}`, { state: { mode: 'edit' } })}>
                      <EditOutlinedIcon fontSize="small" />
                    </button>
                  )}
                </div>
              )
            }] : [])
          ]}
        />
      </div>
    </>
  );
}
