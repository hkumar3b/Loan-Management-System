'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { ApiResponse, Loan } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    loanId: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchLoans = async () => {
    try {
      const res = await apiClient<ApiResponse<Loan[]>>(
        '/loan/dashboard/applied'
      );
      if (res.success && res.data) setLoans(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleApprove = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      const res = await apiClient<ApiResponse>(
        `/loan/dashboard/${loanId}/sanction`,
        { method: 'PATCH', body: { action: 'approve' } }
      );
      if (res.success) await fetchLoans();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectionReason.trim()) return;
    setActionLoading(rejectModal.loanId);
    try {
      const res = await apiClient<ApiResponse>(
        `/loan/dashboard/${rejectModal.loanId}/sanction`,
        {
          method: 'PATCH',
          body: { action: 'reject', rejectionReason },
        }
      );
      if (res.success) {
        setRejectModal(null);
        setRejectionReason('');
        await fetchLoans();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getBorrowerName = (loan: Loan) => {
    if (typeof loan.borrowerId === 'object') return loan.borrowerId.name;
    return '—';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sanction</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and approve or reject loan applications.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No pending applications.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {loans.map((loan) => (
            <div
              key={loan._id}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {getBorrowerName(loan)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Applied{' '}
                    {loan.appliedAt
                      ? new Date(loan.appliedAt).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                <Badge status={loan.status} />
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Loan Amount</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    ₹{loan.amount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Tenure</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {loan.tenure} days
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Total Repayment</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    ₹{loan.totalRepayment.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(loan._id)}
                  isLoading={actionLoading === loan._id}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => setRejectModal({ loanId: loan._id })}
                  variant="danger"
                  className="flex-1"
                >
                  Reject
                </Button>
                <a
                  href={`http://localhost:5000${loan.salarySlipUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                >
                  View Slip
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Reject Loan
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejection.
            </p>
            <textarea
              className="w-full border border-gray-400 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-red-400 resize-none"
              rows={3}
              placeholder="e.g. Insufficient income proof..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleReject}
                variant="danger"
                isLoading={!!actionLoading}
                className="flex-1"
              >
                Confirm Reject
              </Button>
              <Button
                onClick={() => {
                  setRejectModal(null);
                  setRejectionReason('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}