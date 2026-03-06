import React, { useState, useMemo } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuditFees } from '../context/AuditFeeContext';
import { FileDown, FileSpreadsheet, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Reports: React.FC = () => {
    const { fees } = useAuditFees();

    // Filter state
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedAuditor, setSelectedAuditor] = useState('All');
    const [selectedProject, setSelectedProject] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    // Unique option lists
    const auditors = useMemo(() => ['All', ...Array.from(new Set(fees.map(f => f.auditorName))).sort()], [fees]);
    const projects = useMemo(() => ['All', ...Array.from(new Set(fees.map(f => f.project))).sort()], [fees]);

    // Parse a dd/mm/yyyy or yyyy-mm-dd string into a Date for comparison
    const parseDate = (d: string): Date | null => {
        if (!d) return null;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
            const [dd, mm, yyyy] = d.split('/');
            return new Date(`${yyyy}-${mm}-${dd}`);
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d);
        return null;
    };

    // Format yyyy-mm-dd → dd/mm/yyyy
    const formatDate = (d?: string): string => {
        if (!d) return 'N/A';
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
        const parts = d.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return d;
    };

    // Apply all filters
    const filtered = useMemo(() => {
        const from = parseDate(fromDate);
        const to = parseDate(toDate);

        return fees.filter(fee => {
            const feeDate = parseDate(fee.auditStartDate || '');

            if (from && feeDate && feeDate < from) return false;
            if (to && feeDate && feeDate > to) return false;
            if (selectedAuditor !== 'All' && fee.auditorName !== selectedAuditor) return false;
            if (selectedProject !== 'All' && fee.project !== selectedProject) return false;
            if (selectedStatus !== 'All' && fee.paymentStatus !== selectedStatus) return false;
            return true;
        });
    }, [fees, fromDate, toDate, selectedAuditor, selectedProject, selectedStatus]);

    // Summary KPIs
    const totalGross = filtered.reduce((s, f) => s + f.cediEquivalent, 0);
    const totalWHT = filtered.reduce((s, f) => s + f.withholdingTax, 0);
    const totalNet = filtered.reduce((s, f) => s + f.netPay, 0);

    // Table columns for export
    const reportColumns = ['Auditor', 'Project', 'Start Date', 'Currency', 'Amount', 'FX Rate', 'Gross (GHC)', 'WHT %', 'WHT (GHC)', 'Net Pay (GHC)', 'Status'];
    const reportRows = (data: typeof filtered) => data.map(f => [
        f.auditorName,
        f.project,
        formatDate(f.auditStartDate),
        f.currency || 'USD',
        f.totalAmountDue.toFixed(2),
        f.roe.toString(),
        f.cediEquivalent.toFixed(2),
        `${f.whtRate}%`,
        f.withholdingTax.toFixed(2),
        f.netPay.toFixed(2),
        f.paymentStatus,
    ]);

    // PDF Export
    const exportPDF = () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(16);
        doc.text('Audit Fee Report', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 22);
        autoTable(doc, {
            startY: 28,
            head: [reportColumns],
            body: reportRows(filtered),
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [99, 102, 241] },
        });
        // Summary footer
        const finalY = (doc as any).lastAutoTable.finalY + 6;
        doc.setFontSize(9);
        doc.text(`Total Records: ${filtered.length}   |   Total Gross: GHC ${totalGross.toFixed(2)}   |   Total WHT: GHC ${totalWHT.toFixed(2)}   |   Total Net Pay: GHC ${totalNet.toFixed(2)}`, 14, finalY);
        doc.save('audit-fee-report.pdf');
    };

    // Excel Export
    const exportExcel = () => {
        const wsData = [
            reportColumns,
            ...reportRows(filtered),
            [],
            ['', '', '', '', '', '', '', '', 'TOTALS →', `GHC ${totalGross.toFixed(2)}`, `GHC ${totalWHT.toFixed(2)}`, `GHC ${totalNet.toFixed(2)}`],
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Audit Fee Report');
        XLSX.writeFile(wb, 'audit-fee-report.xlsx');
    };

    const inputStyle: React.CSSProperties = {
        padding: '0.5rem 0.75rem',
        borderRadius: '6px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text-main)',
        fontSize: '0.875rem',
        outline: 'none',
    };

    const kpiCard = (label: string, value: string, accent: string) => (
        <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', borderLeft: `4px solid ${accent}`, boxShadow: 'var(--shadow-sm)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 500, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</p>
        </div>
    );

    return (
        <DashboardLayout>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>Reports</h1>
                    <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>Filter and export audit fee data by date, auditor, or project</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={exportPDF}
                        disabled={filtered.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: filtered.length === 0 ? 'not-allowed' : 'pointer', opacity: filtered.length === 0 ? 0.5 : 1 }}
                    >
                        <FileDown size={16} /> Export PDF
                    </button>
                    <button
                        onClick={exportExcel}
                        disabled={filtered.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: filtered.length === 0 ? 'not-allowed' : 'pointer', opacity: filtered.length === 0 ? 0.5 : 1 }}
                    >
                        <FileSpreadsheet size={16} /> Export Excel
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Filter size={16} /> Filters
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--secondary)', marginBottom: '0.3rem' }}>From Date</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--secondary)', marginBottom: '0.3rem' }}>To Date</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--secondary)', marginBottom: '0.3rem' }}>Auditor</label>
                        <select value={selectedAuditor} onChange={e => setSelectedAuditor(e.target.value)} style={inputStyle}>
                            {auditors.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--secondary)', marginBottom: '0.3rem' }}>Project</label>
                        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} style={inputStyle}>
                            {projects.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: 'var(--secondary)', marginBottom: '0.3rem' }}>Payment Status</label>
                        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={inputStyle}>
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="70% Paid">70% Paid</option>
                            <option value="Fully Paid">Fully Paid</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                            onClick={() => { setFromDate(''); setToDate(''); setSelectedAuditor('All'); setSelectedProject('All'); setSelectedStatus('All'); }}
                            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--secondary)', fontSize: '0.875rem', cursor: 'pointer' }}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {kpiCard('Total Records', `${filtered.length}`, 'var(--primary)')}
                {kpiCard('Total Gross (GHC)', `GHC ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '#f59e0b')}
                {kpiCard('Total WHT (GHC)', `GHC ${totalWHT.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '#ef4444')}
                {kpiCard('Total Net Pay (GHC)', `GHC ${totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '#16a34a')}
            </div>

            {/* Report Table */}
            <div style={{ background: 'var(--surface)', borderRadius: '0.75rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '900px' }}>
                    <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            {reportColumns.map(col => (
                                <th key={col} style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--secondary)', textAlign: 'left', whiteSpace: 'nowrap' }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={reportColumns.length} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No records match the selected filters.
                                </td>
                            </tr>
                        ) : (
                            filtered.map(fee => (
                                <tr key={fee.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{fee.auditorName}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--secondary)' }}>{fee.project}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{formatDate(fee.auditStartDate)}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{fee.currency || 'USD'}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{fee.totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{fee.roe}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{fee.cediEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{fee.whtRate}%</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{fee.withholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{fee.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: fee.paymentStatus === 'Fully Paid' ? 'var(--success-light)' : fee.paymentStatus === '70% Paid' ? 'var(--primary-light)' : 'var(--warning-light)',
                                            color: fee.paymentStatus === 'Fully Paid' ? 'var(--success)' : fee.paymentStatus === '70% Paid' ? 'var(--primary)' : '#d97706',
                                        }}>
                                            {fee.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {filtered.length > 0 && (
                        <tfoot style={{ borderTop: '2px solid var(--border)', backgroundColor: '#f8fafc' }}>
                            <tr>
                                <td colSpan={6} style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--secondary)' }}>TOTALS ({filtered.length} records)</td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>GHC {totalGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td></td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>GHC {totalWHT.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>GHC {totalNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </DashboardLayout>
    );
};

export default Reports;
