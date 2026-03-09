import React from 'react';
import { AuditFeeRecord } from '../types/AuditFee';
import { X } from 'lucide-react';

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
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;
