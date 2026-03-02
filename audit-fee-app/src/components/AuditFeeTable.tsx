import React, { useState } from 'react';
import { useAuditFees } from '../context/AuditFeeContext';
import { AuditFeeRecord } from '../types/AuditFee';

interface Props {
    onProcessPayment: (record: AuditFeeRecord) => void;
}

const AuditFeeTable: React.FC<Props> = ({ onProcessPayment }) => {
    const { fees } = useAuditFees();
    const [selectedProject, setSelectedProject] = useState<string>('All');

    // Get unique list of projects
    const uniqueProjects = Array.from(new Set(fees.map(fee => fee.project))).sort();

    // Filter fees based on the selected project
    const filteredFees = selectedProject === 'All'
        ? fees
        : fees.filter(fee => fee.project === selectedProject);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending': return 'badge badge-warning';
            case '70% Paid': return 'badge badge-primary';
            case 'Fully Paid': return 'badge badge-success';
            default: return 'badge badge-secondary';
        }
    };

    return (
        <div className="overflow-x-auto w-full" style={{ width: '100%', overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <table className="w-full text-left" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
                <thead className="bg-[#f1f5f9] text-secondary text-sm font-semibold" style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                    <tr>
                        <th className="p-4" style={{ padding: '1rem' }}>Auditor</th>
                        <th className="p-4" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Project
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                style={{
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    color: 'var(--text-main)',
                                    fontSize: '0.75rem',
                                    fontWeight: 'normal',
                                    marginLeft: '0.5rem',
                                    outline: 'none',
                                    maxWidth: '150px'
                                }}
                            >
                                <option value="All">All Projects</option>
                                {uniqueProjects.map(project => (
                                    <option key={project} value={project}>{project}</option>
                                ))}
                            </select>
                        </th>
                        <th className="p-4" style={{ padding: '1rem' }}>Net Pay (GHC)</th>
                        <th className="p-4" style={{ padding: '1rem' }}>70% Payment</th>
                        <th className="p-4" style={{ padding: '1rem' }}>30% Payment</th>
                        <th className="p-4" style={{ padding: '1rem' }}>Status</th>
                        <th className="p-4 text-center" style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm" style={{ fontSize: '0.875rem' }}>
                    {filteredFees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-background transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="p-4 font-medium text-main" style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>{fee.auditorName}</td>
                            <td className="p-4 text-secondary" style={{ padding: '1rem', color: 'var(--secondary)' }}>{fee.project}</td>
                            <td className="p-4 font-semibold text-main" style={{ padding: '1rem', fontWeight: 600 }}>{fee.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>
                                <span className={fee.payment70Status === 'Paid' ? 'text-success font-semibold' : 'text-muted'} style={{ color: fee.payment70Status === 'Paid' ? 'var(--success)' : 'var(--text-muted)', fontWeight: fee.payment70Status === 'Paid' ? 600 : 400 }}>
                                    {fee.payment70Status}
                                </span>
                            </td>
                            <td className="p-4" style={{ padding: '1rem' }}>
                                <span className={fee.payment30Status === 'Paid' ? 'text-success font-semibold' : 'text-muted'} style={{ color: fee.payment30Status === 'Paid' ? 'var(--success)' : 'var(--text-muted)', fontWeight: fee.payment30Status === 'Paid' ? 600 : 400 }}>
                                    {fee.payment30Status}
                                </span>
                            </td>
                            <td className="p-4" style={{ padding: '1rem' }}>
                                <span className={getStatusBadge(fee.paymentStatus)}>{fee.paymentStatus}</span>
                            </td>
                            <td className="p-4 text-center" style={{ padding: '1rem', textAlign: 'center' }}>
                                <button
                                    onClick={() => onProcessPayment(fee)}
                                    className="btn btn-outline btn-sm"
                                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '0.375rem', cursor: 'pointer', background: 'transparent' }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Process
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredFees.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-muted" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No audit fees found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AuditFeeTable;
