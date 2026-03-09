import React from 'react';
import { AuditFeeRecord } from '../types/AuditFee';
import { X, FileDown, Mail } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: AuditFeeRecord | null;
}

const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, record }) => {
    if (!isOpen || !record) return null;

    const formatGHC = (amount: number) => {
        return `GHC ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatUSD = (amount: number) => {
        return `${record.currency || 'USD'} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const generatePDFDoc = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Payment Summary: ${record.project}`, 14, 15);

        doc.setFontSize(10);
        doc.text(`Auditor: ${record.auditorName}`, 14, 22);
        doc.text(`Date Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 27);

        const paid70 = record.payment70Status === 'Paid' ? record.netPay * 0.7 : 0;
        const paid30 = record.payment30Status === 'Paid' ? record.netPay * 0.3 : 0;
        const totalPaid = paid70 + paid30;

        autoTable(doc, {
            startY: 33,
            head: [['Description', 'Amount / Status']],
            body: [
                ['Amount Due', formatUSD(record.totalAmountDue)],
                ['FX Rate', record.roe.toString()],
                ['Gross Amount (GHC)', record.cediEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2 })],
                [`WHT (${record.whtRate}%)`, `- ${record.withholdingTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
                ['Net Pay (GHC)', record.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })],
                ['70% Payment Status', `${record.payment70Status} ${record.payment70Status === 'Paid' ? `(GHC ${paid70.toLocaleString(undefined, { minimumFractionDigits: 2 })})` : ''}`],
                ['30% Payment Status', `${record.payment30Status} ${record.payment30Status === 'Paid' ? `(GHC ${paid30.toLocaleString(undefined, { minimumFractionDigits: 2 })})` : ''}`],
                ['Total Amount Paid', totalPaid > 0 ? `GHC ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'GHC 0.00'],
                ['Overall Status', record.paymentStatus],
            ],
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [99, 102, 241] }, // Indigo color matching primary
        });

        return doc;
    };

    const exportPDF = () => {
        const doc = generatePDFDoc();
        doc.save(`Audit_Payment_${record.auditorName.replace(/\s+/g, '_')}_${record.project}.pdf`);
    };

    const sendEmail = () => {
        const paid70 = record.payment70Status === 'Paid' ? record.netPay * 0.7 : 0;
        const paid30 = record.payment30Status === 'Paid' ? record.netPay * 0.3 : 0;
        const totalPaid = paid70 + paid30;

        // Generate and download PDF first so user has it immediately available to attach
        const doc = generatePDFDoc();
        const fileName = `Audit_Payment_${record.auditorName.replace(/\s+/g, '_')}_${record.project}.pdf`;
        doc.save(fileName);

        const subject = encodeURIComponent(`Payment Summary: ${record.project} - ${record.auditorName}`);
        const body = encodeURIComponent(`Please review the Payment Summary for ${record.auditorName} on project ${record.project}.

[NOTE: I have auto-downloaded the "${fileName}" file to your computer. Please manually drag and drop it into this email as an attachment, as browsers do not allow websites to automatically attach files to email clients for security reasons!]

Summary Details
-----------------------------------
Amount Due: ${formatUSD(record.totalAmountDue)}
FX Rate: ${record.roe}
Gross Amount: ${formatGHC(record.cediEquivalent)}
WHT (${record.whtRate}%): - ${formatGHC(record.withholdingTax)}
Net Pay: ${formatGHC(record.netPay)}

Payment Status
-----------------------------------
70% Payment: ${record.payment70Status} ${record.payment70Status === 'Paid' ? `(${formatGHC(paid70)})` : ''}
30% Payment: ${record.payment30Status} ${record.payment30Status === 'Paid' ? `(${formatGHC(paid30)})` : ''}
Total Amount Paid: ${totalPaid > 0 ? formatGHC(totalPaid) : 'GHC 0.00'}
Overall Status: ${record.paymentStatus}

Thank you.`);

        // Use mailto: protocol. This will open the user's default email client.
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="bg-surface w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden" style={{ backgroundColor: 'var(--surface)', width: '100%', maxWidth: '28rem', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
                <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="text-xl font-bold text-main" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Payment Summary</h3>
                    <button onClick={onClose} className="text-muted hover:text-main" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="bg-background p-4 rounded-lg border border-border" style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <p className="text-sm text-secondary mb-2">Auditor: <span className="font-semibold text-main">{record.auditorName}</span></p>
                        <p className="text-sm text-secondary mb-2">Project: <span className="font-semibold text-main">{record.project}</span></p>
                        <p className="text-sm text-secondary mb-2">Amount Due: <span className="font-semibold text-main">{formatUSD(record.totalAmountDue)}</span></p>
                        <p className="text-sm text-secondary mb-2">FX Rate: <span className="font-semibold text-main">{record.roe}</span></p>
                    </div>

                    <div className="bg-background p-4 rounded-lg border border-border" style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-sm text-secondary">Gross Amount:</span>
                            <span className="font-semibold text-main">{formatGHC(record.cediEquivalent)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-sm text-secondary">WHT ({record.whtRate}%):</span>
                            <span className="font-semibold text-main text-danger" style={{ color: 'var(--danger, #ef4444)' }}>- {formatGHC(record.withholdingTax)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <span className="text-base font-bold text-main">Net Pay:</span>
                            <span className="text-base font-bold text-primary" style={{ color: 'var(--primary)' }}>{formatGHC(record.netPay)}</span>
                        </div>
                    </div>

                    {(() => {
                        const paid70 = record.payment70Status === 'Paid' ? record.netPay * 0.7 : 0;
                        const paid30 = record.payment30Status === 'Paid' ? record.netPay * 0.3 : 0;
                        const totalPaid = paid70 + paid30;

                        return (
                            <div className="bg-background p-4 rounded-lg border border-border" style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                <h4 className="text-sm font-bold text-main mb-3" style={{ marginBottom: '0.75rem' }}>Payment Status</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span className="text-sm text-secondary">70% Payment:</span>
                                    <span className="text-sm font-semibold" style={{ color: record.payment70Status === 'Paid' ? 'var(--success)' : 'var(--warning, #d97706)' }}>
                                        {record.payment70Status} {record.payment70Status === 'Paid' && `(${formatGHC(paid70)})`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span className="text-sm text-secondary">30% Payment:</span>
                                    <span className="text-sm font-semibold" style={{ color: record.payment30Status === 'Paid' ? 'var(--success)' : 'var(--warning, #d97706)' }}>
                                        {record.payment30Status} {record.payment30Status === 'Paid' && `(${formatGHC(paid30)})`}
                                    </span>
                                </div>
                                {(paid70 > 0 || paid30 > 0) && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border)' }}>
                                        <span className="text-sm font-bold text-secondary">Total Amount Paid:</span>
                                        <span className="text-sm font-bold text-success" style={{ color: 'var(--success)' }}>
                                            {formatGHC(totalPaid)}
                                        </span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <span className="text-sm font-bold text-main">Overall Status:</span>
                                    <span className="text-sm font-bold" style={{
                                        color: record.paymentStatus === 'Fully Paid' ? 'var(--success)' :
                                            record.paymentStatus === '70% Paid' ? 'var(--primary)' : 'var(--warning, #d97706)'
                                    }}>
                                        {record.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                            onClick={exportPDF}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'background-color 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                        >
                            <FileDown size={18} /> Export PDF
                        </button>
                        <button
                            onClick={sendEmail}
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: '0.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'background-color 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                            <Mail size={18} /> Email Summary
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
