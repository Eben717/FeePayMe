import React, { useState, useMemo, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuditFees } from '../context/AuditFeeContext';
import { AuditFeeRecord } from '../types/AuditFee';
import SummaryModal from './SummaryModal';

interface Props {
    onProcessPayment: (record: AuditFeeRecord) => void;
}

const AuditFeeTable: React.FC<Props> = ({ onProcessPayment }) => {
    const { fees, addFee, removeFee, updateFee } = useAuditFees();
    const [selectedProject, setSelectedProject] = useState<string>('All');
    const [summaryRecord, setSummaryRecord] = useState<AuditFeeRecord | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: keyof AuditFeeRecord | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

    const requestSort = (key: keyof AuditFeeRecord) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // New Record State
    const [newAuditor, setNewAuditor] = useState('');
    const [newProject, setNewProject] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newCurrency, setNewCurrency] = useState('USD');
    const [newAmount, setNewAmount] = useState<number | ''>('');
    const [newFxRate, setNewFxRate] = useState<number | ''>('');
    const [newWhtRate, setNewWhtRate] = useState<number | ''>(7.5);

    // Filter unique auditors from existing fees
    const uniqueAuditors = useMemo(() => {
        return Array.from(new Set(fees.map(fee => fee.auditorName))).sort();
    }, [fees]);

    // Filter unique projects from existing fees
    const uniqueProjectsList = useMemo(() => {
        return Array.from(new Set(fees.map(fee => fee.project))).sort();
    }, [fees]);

    // Drag to scroll logic
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    const onMouseDown = (e: React.MouseEvent) => {
        if (!tableContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - tableContainerRef.current.offsetLeft);
        setScrollLeft(tableContainerRef.current.scrollLeft);
        setStartY(e.pageY - tableContainerRef.current.offsetTop);
        setScrollTop(tableContainerRef.current.scrollTop);
    };

    const onMouseLeave = () => {
        setIsDragging(false);
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !tableContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - tableContainerRef.current.offsetLeft;
        const walkX = (x - startX) * 2; // scroll-fast multiplier
        tableContainerRef.current.scrollLeft = scrollLeft - walkX;

        const y = e.pageY - tableContainerRef.current.offsetTop;
        const walkY = (y - startY) * 2;
        tableContainerRef.current.scrollTop = scrollTop - walkY;
    };

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
            whtRate: Number(newWhtRate) || 7.5,
        });

        // Reset form
        setNewAuditor('');
        setNewProject('');
        setNewStartDate('');
        setNewCurrency('USD');
        setNewAmount('');
        setNewFxRate('');
        setNewWhtRate(7.5);
    };

    // Get unique list of projects
    const uniqueProjects = Array.from(new Set(fees.map(fee => fee.project))).sort();

    // Filter fees based on the selected project
    const filteredFees = selectedProject === 'All'
        ? fees
        : fees.filter(fee => fee.project === selectedProject);

    // Sort the filtered fees
    const sortedFees = useMemo(() => {
        let sortableFees = [...filteredFees];
        if (sortConfig.key !== null) {
            sortableFees.sort((a, b) => {
                let valA: any = a[sortConfig.key as keyof AuditFeeRecord] || '';
                let valB: any = b[sortConfig.key as keyof AuditFeeRecord] || '';

                if (sortConfig.key === 'auditStartDate') {
                    const parseDate = (d: any) => {
                        if (typeof d !== 'string' || d === 'N/A') return 0;
                        if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
                            const [dd, mm, yyyy] = d.split('/');
                            return new Date(`${yyyy}-${mm}-${dd}`).getTime();
                        }
                        return new Date(d).getTime() || 0;
                    };
                    valA = parseDate(valA);
                    valB = parseDate(valB);
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableFees;
    }, [filteredFees, sortConfig]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending': return 'badge badge-warning';
            case '70% Paid': return 'badge badge-primary';
            case 'Fully Paid': return 'badge badge-success';
            default: return 'badge badge-secondary';
        }
    };

    // Normalise any date string to dd/mm/yyyy for display.
    // Handles ISO format (yyyy-mm-dd from <input type="date">) and pre-existing dd/mm/yyyy values.
    const formatDate = (dateStr?: string): string => {
        if (!dateStr) return 'N/A';
        // Already in dd/mm/yyyy format (legacy mock / localStorage data)
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
        // Convert yyyy-mm-dd → dd/mm/yyyy (from HTML date input)
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateStr;
    };

    return (
        <div
            ref={tableContainerRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseLeave}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className="overflow-auto w-full"
            style={{
                width: '100%',
                overflowX: 'auto',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 200px)',
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: isDragging ? 'none' : 'auto' // Prevent text selection while dragging
            }}
        >
            <table className="w-full text-left" style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
                <thead className="bg-[#f1f5f9] text-secondary text-sm font-semibold" style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                    <tr>
                        <th className="p-4" style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('auditorName')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                Auditor
                                {sortConfig.key === 'auditorName' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                            </div>
                        </th>
                        <th className="p-4" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('project')}>
                                Project
                                {sortConfig.key === 'project' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                            </div>
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
                        <th className="p-4" style={{ padding: '1rem', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }} onClick={() => requestSort('auditStartDate')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                Audit Start Date
                                {sortConfig.key === 'auditStartDate' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : null}
                            </div>
                        </th>
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
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    list="auditor-options"
                                    placeholder="Select or type Auditor"
                                    value={newAuditor}
                                    onChange={(e) => setNewAuditor(e.target.value)}
                                    className="w-full"
                                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                                />
                                <datalist id="auditor-options">
                                    {uniqueAuditors.map(auditor => (
                                        <option key={auditor} value={auditor} />
                                    ))}
                                </datalist>
                            </div>
                        </td>
                        <td className="p-4" style={{ padding: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    list="project-options"
                                    placeholder="Select or type Project"
                                    value={newProject}
                                    onChange={(e) => setNewProject(e.target.value)}
                                    className="w-full"
                                    style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                                />
                                <datalist id="project-options">
                                    {uniqueProjectsList.map(project => (
                                        <option key={project} value={project} />
                                    ))}
                                </datalist>
                            </div>
                        </td>
                        <td className="p-4" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                            <input
                                type="text"
                                placeholder="dd/mm/yyyy"
                                value={newStartDate}
                                onChange={(e) => {
                                    let val = e.target.value.replace(/[^0-9/]/g, '');
                                    if (val.length === 2 && !val.includes('/') && newStartDate.length <= val.length) val += '/';
                                    if (val.length === 5 && val.split('/').length === 2 && newStartDate.length <= val.length) val += '/';
                                    setNewStartDate(val.slice(0, 10));
                                }}
                                className="w-full"
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem', minWidth: '110px' }}
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
                                step="any"
                                onChange={(e) => setNewFxRate(parseFloat(e.target.value) || '')}
                                className="w-full"
                                style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.875rem', width: '80px' }}
                            />
                        </td>
                        <td className="p-4 text-muted italic" style={{ padding: '1rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Auto</td>
                        <td className="p-4" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <input
                                    type="number"
                                    value={newWhtRate}
                                    min={0}
                                    max={100}
                                    step={0.5}
                                    onChange={(e) => setNewWhtRate(parseFloat(e.target.value) || '')}
                                    style={{ width: '55px', padding: '0.3rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.875rem', textAlign: 'right' }}
                                />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>%</span>
                            </div>
                        </td>
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

                    {sortedFees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-background transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="p-4 font-medium text-main" style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>{fee.auditorName}</td>
                            <td className="p-4 text-secondary" style={{ padding: '1rem', color: 'var(--secondary)' }}>{fee.project}</td>
                            <td className="p-4" style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{formatDate(fee.auditStartDate)}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.currency || 'USD'}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.roe}</td>
                            <td className="p-4" style={{ padding: '1rem' }}>{fee.cediEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="p-4" style={{ padding: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <input
                                        type="number"
                                        value={fee.whtRate}
                                        min={0}
                                        max={100}
                                        step={0.5}
                                        onChange={(e) => updateFee(fee.id, { whtRate: parseFloat(e.target.value) || 0 })}
                                        style={{ width: '55px', padding: '0.3rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.875rem', textAlign: 'right' }}
                                    />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>%</span>
                                </div>
                            </td>
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
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => onProcessPayment(fee)}
                                        className="btn btn-outline btn-sm"
                                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '0.375rem', cursor: 'pointer', background: 'transparent' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Process
                                    </button>
                                    <button
                                        onClick={() => removeFee(fee.id)}
                                        className="btn btn-outline btn-sm"
                                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', border: '1px solid var(--error, #ef4444)', color: 'var(--error, #ef4444)', borderRadius: '0.375rem', cursor: 'pointer', background: 'transparent' }}
                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setSummaryRecord(fee)}
                                        className="btn btn-outline btn-sm"
                                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', border: '1px solid var(--info, #3b82f6)', color: 'var(--info, #3b82f6)', borderRadius: '0.375rem', cursor: 'pointer', background: 'transparent' }}
                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        Summary
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {sortedFees.length === 0 && (
                        <tr>
                            <td colSpan={14} className="p-8 text-center text-muted" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No audit fees found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <SummaryModal
                isOpen={!!summaryRecord}
                onClose={() => setSummaryRecord(null)}
                record={summaryRecord}
            />
        </div>
    );
};

export default AuditFeeTable;
