import React from 'react';
import { AuditFeeRecord } from '../types/AuditFee';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: AuditFeeRecord | null;
    onPay70: (id: string) => void;
    onPay30: (id: string) => void;
    onUnpay70: (id: string) => void;
    onUnpay30: (id: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, record, onPay70, onPay30, onUnpay70, onUnpay30 }) => {
    if (!isOpen || !record) return null;

    const totalPayable = record.netPay;
    const pay70Amount = totalPayable * 0.7;
    const pay30Amount = totalPayable * 0.3;

    const canPay70 = record.paymentStatus === 'Pending';
    const canPay30 = record.paymentStatus === '70% Paid';

    const formatCurrency = (amount: number) => {
        return `GHC ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="bg-surface w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden" style={{ backgroundColor: 'var(--surface)', width: '100%', maxWidth: '28rem', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
                <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="text-xl font-bold text-main" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Process Payment</h3>
                    <button onClick={onClose} className="text-muted hover:text-main" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6 space-y-3" style={{ marginBottom: '1.5rem' }}>
                    <div className="bg-background p-4 rounded-lg border border-border" style={{ backgroundColor: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                        <p className="text-sm text-secondary mb-1">Auditor: <span className="font-semibold text-main">{record.auditorName}</span></p>
                        <p className="text-sm text-secondary mb-1">Project: <span className="font-semibold text-main">{record.project}</span></p>
                        <p className="text-sm text-secondary">Total Net Pay: <span className="font-bold text-primary">{formatCurrency(totalPayable)}</span></p>
                    </div>
                </div>

                <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* 70% Payment Block */}
                    <div className={`p-4 border rounded-lg flex justify-between items-center ${canPay70 ? 'border-primary bg-primary-light' : 'border-border bg-background opacity-75'}`} style={{ padding: '1rem', border: '1px solid', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: canPay70 ? 'var(--primary)' : 'var(--border)', backgroundColor: canPay70 ? 'var(--primary-light)' : 'var(--background)' }}>
                        <div>
                            <p className="font-semibold text-main" style={{ fontWeight: 600 }}>70% Part-Payment</p>
                            <p className="text-sm text-secondary">{formatCurrency(pay70Amount)}</p>
                        </div>
                        {record.payment70Status === 'Paid' ? (
                            <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="flex items-center text-success text-sm font-semibold" style={{ display: 'flex', alignItems: 'center', color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600 }}>
                                    <CheckCircle size={16} className="mr-1" style={{ marginRight: '0.25rem' }} /> Paid
                                </span>
                                {record.paymentStatus !== 'Fully Paid' && (
                                    <button
                                        onClick={() => { onUnpay70(record.id); onClose(); }}
                                        className="text-xs border border-danger text-danger rounded px-2 py-1 hover:bg-danger hover:text-white transition-colors"
                                        style={{ fontSize: '0.75rem', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', background: 'transparent', cursor: 'pointer' }}
                                    >
                                        Undo
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => { onPay70(record.id); onClose(); }}
                                disabled={!canPay70}
                                className="btn btn-primary btn-sm"
                                style={{ cursor: canPay70 ? 'pointer' : 'not-allowed', opacity: canPay70 ? 1 : 0.5 }}
                            >
                                Pay 70%
                            </button>
                        )}
                    </div>

                    {/* 30% Payment Block */}
                    <div className={`p-4 border rounded-lg flex justify-between items-center ${canPay30 ? 'border-primary bg-primary-light' : 'border-border bg-background opacity-75'}`} style={{ padding: '1rem', border: '1px solid', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: canPay30 ? 'var(--primary)' : 'var(--border)', backgroundColor: canPay30 ? 'var(--primary-light)' : 'var(--background)' }}>
                        <div>
                            <p className="font-semibold text-main" style={{ fontWeight: 600 }}>30% Part-Payment</p>
                            <p className="text-sm text-secondary">{formatCurrency(pay30Amount)}</p>
                        </div>
                        {record.payment30Status === 'Paid' ? (
                            <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="flex items-center text-success text-sm font-semibold" style={{ display: 'flex', alignItems: 'center', color: 'var(--success)', fontSize: '0.875rem', fontWeight: 600 }}>
                                    <CheckCircle size={16} className="mr-1" style={{ marginRight: '0.25rem' }} /> Paid
                                </span>
                                <button
                                    onClick={() => { onUnpay30(record.id); onClose(); }}
                                    className="text-xs border border-danger text-danger rounded px-2 py-1 hover:bg-danger hover:text-white transition-colors"
                                    style={{ fontSize: '0.75rem', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', background: 'transparent', cursor: 'pointer' }}
                                >
                                    Undo
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { onPay30(record.id); onClose(); }}
                                disabled={!canPay30}
                                className="btn btn-primary btn-sm"
                                style={{ cursor: canPay30 ? 'pointer' : 'not-allowed', opacity: canPay30 ? 1 : 0.5 }}
                            >
                                Pay 30%
                            </button>
                        )}
                    </div>
                </div>

                {record.paymentStatus === 'Fully Paid' && (
                    <div className="mt-4 p-3 bg-success-light text-success flex items-center rounded text-sm" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                        <AlertCircle size={16} className="mr-2" style={{ marginRight: '0.5rem' }} />
                        This auditor has been fully paid. No further payments can be made.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
