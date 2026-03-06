import React, { useState } from 'react';
import { useAuditFees } from '../context/AuditFeeContext';
import { AuditFeeRecord } from '../types/AuditFee';

interface Props {
    onProcessPayment: (record: AuditFeeRecord) => void;
}

const AuditFeeTable: React.FC<Props> = ({ onProcessPayment }) => {
    const { fees, addFee } = useAuditFees();
    const [selectedProject, setSelectedProject] = useState<string>('All');

    // New Record State
    const [newAuditor, setNewAuditor] = useState('');
    const [newProject, setNewProject] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newCurrency, setNewCurrency] = useState('USD');
    const [newAmount, setNewAmount] = useState<number | ''>('');
    const [newFxRate, setNewFxRate] = useState<number | ''>('');

    const handleAddFee = () => {
        if (!newAuditor || !newProject || newAmount === '' || newFxRate === '') {
            alert('Please fill in Auditor, Project, Amount, and FX Rate.');
            return;
        }

        addFee({
            auditMonth: new Date().toLocaleString('default', { month: 'long' }).toUpperCase(),
            auditPeriod: new Date().toLocaleDateString('en-GB'),
            auditorName: newAuditor,
            project: newProject,
            serviceDescription: 'Audit', // Default
            auditType: 'Routine', // Default
            announcedUnannounced: 'Announced', // Default
            auditStartDate: newStartDate,
            standard: 'N/A',
            locationType: 'Local',
            auditLocation: 'N/A',
            auditRate: 0,
            travelRate: 0,
            actualAuditDays: 0,
            actualTravelDays: 0,
            reportingDays: 0,
            sampleDays: 0,
            totalNoDays: 0,
            currency: newCurrency,
            totalAmountDue: Number(newAmount),
            roe: Number(newFxRate),
            contractNum: `NEW-${Date.now().toString().slice(-4)}`,
            whtRate: 7.5, // Default WHT Rate
        });

        // Reset form
        setNewAuditor('');
        setNewProject('');
        setNewStartDate('');
        setNewCurrency('USD');
        setNewAmount('');
        setNewFxRate('');
    };

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
                        <th className="p-4" style={{ padding: '1rem' }}>Audit Start Date</th>
                        <th className="p-4" style={{ padding: '1rem' }}>Currency</th>
                        <th className="p-4" style={{ padding: '1rem' }}>Amount</th>
                        <th className="p-4" style={{ padding: '1rem' }}>FX Rate</th>
                        <th className="p-4" style={{ padding: '1rem' }}>Gross Amount (Cedi)</th>
                        <th className="p-4" style={{ padding: '1rem' }}>WHT Rate (%)</th>
                        <th className="p-4" style={{ padding: '1rem' }}>WHT Amount (GHC)</th>
                        <th className="p-4" style={{ padding: '1rem' }}>Net Pay (GHC)</th>
                        <th className="p-4" style={{ padding: '1rem' }}>70% Payment</th>
                        <th className="p-4" style={{ padding: '1rem' }}>30% Payment</th>
                        <th className="p-4" style={{ padding: '1rem' }}>Status</th>
                        <th className="p-4 text-center" style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm" style={{ fontSize: '0.875rem' }}>
                    {/* Add New Record Row */}
                    <tr className="bg-[#f8fafc]" style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                        <td className="p-4" style={{ padding: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Auditor Name"
                                value={newAuditor}
                                onChange={(e) => setNewAuditor(e.target.value)}
                                className="w-full"
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                            />
                        </td>
                        <td className="p-4" style={{ padding: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Project"
                                value={newProject}
                                onChange={(e) => setNewProject(e.target.value)}
                                className="w-full"
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                            />
                        </td>
                        <td className="p-4" style={{ padding: '1rem' }}>
                            <input
                                type="date"
                                value={newStartDate}
                                onChange={(e) => setNewStartDate(e.target.value)}
                                className="w-full"
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                            />
                        </td>
                        <td className="p-4" style={{ padding: '1rem' }}>
                            <select
                                value={newCurrency}
                                onChange={(e) => setNewCurrency(e.target.value)}
                                className="w-full"
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem', outline: 'none' }}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </td>
                        <td className="p-4" style={{ padding: '1rem' }}>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newAmount}
                                onChange={(e) => setNewAmount(parseFloat(e.target.value) || '')}
                                className="w-full"
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '80px' }}
                            />
                        </td>
                        <td className="p-4" style={{ padding: '1rem' }}>
                            <input
                                type="number"
                                placeholder="FX Rate"
                                value={newFxRate}
                                onChange={(e) => setNewFxRate(parseFloat(e.target.value) || '')}
                                className="w-full"
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '80px' }}
                            />
                        </td>
                        <td className="p-4 text-muted italic" style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Auto</td>
                        <td className="p-4 text-muted italic" style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>7.5%</td>
                        <td className="p-4 text-muted italic" style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Auto</td>
                        <td className="p-4 text-muted italic" style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Auto</td>
                        <td className="p-4 text-muted italic" style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending</td>
                        <td className="p-4 text-muted italic" style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending</td>
                        <td className="p-4 text-muted italic" style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending</td>
                        <td className="p-4 text-center" style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                                onClick={handleAddFee}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', border: 'none', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 600 }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                            >
                                Add
                            </button>
                        </td>
                    </tr>

                    {filteredFees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-background transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="p-4 font-medium text-main" style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>{fee.auditorName}</td>
                            <td className="p-4 text-secondary" style={{ padding: '1rem', color: 'var(--secondary)' }}>{fee.project}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.auditStartDate || 'N/A'}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.currency || 'USD'}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.roe}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.cediEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.whtRate}%</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.withholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
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
