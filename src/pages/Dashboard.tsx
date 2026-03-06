import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/Layout/DashboardLayout';
import AuditFeeTable from '../components/AuditFeeTable';
import PaymentModal from '../components/PaymentModal';
import { useAuditFees } from '../context/AuditFeeContext';
import { AuditFeeRecord } from '../types/AuditFee';
import { DollarSign, AlertCircle, CheckCircle2, BarChart2 } from 'lucide-react';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { fees, pay70Percent, pay30Percent, unpay70Percent, unpay30Percent } = useAuditFees();
    const [selectedRecord, setSelectedRecord] = useState<AuditFeeRecord | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // KPIs
    const totalOutstanding = fees.reduce((acc, fee) => {
        if (fee.paymentStatus === 'Pending') return acc + fee.netPay;
        if (fee.paymentStatus === '70% Paid') return acc + (fee.netPay * 0.3);
        return acc;
    }, 0);

    const totalPaid = fees.reduce((acc, fee) => {
        if (fee.paymentStatus === 'Fully Paid') return acc + fee.netPay;
        if (fee.paymentStatus === '70% Paid') return acc + (fee.netPay * 0.7);
        return acc;
    }, 0);

    const pendingCount = fees.filter(f => f.paymentStatus !== 'Fully Paid').length;

    const handleProcessPayment = (record: AuditFeeRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handlePay70 = (id: string) => {
        pay70Percent(id);
    };

    const handlePay30 = (id: string) => {
        pay30Percent(id);
    };

    const handleUnpay70 = (id: string) => {
        unpay70Percent(id);
    };

    const handleUnpay30 = (id: string) => {
        unpay30Percent(id);
    };

    return (
        <DashboardLayout>
            <div className="mb-8" style={{ marginBottom: '2rem' }}>
                <h1 className="text-2xl font-bold text-main mb-2" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard Overview</h1>
                <p className="text-secondary" style={{ color: 'var(--secondary)' }}>Track and manage audit fee payments accurately</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card p-6 border-l-4 border-warning" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-sm font-medium text-secondary mb-1">Total Outstanding</p>
                            <h3 className="text-2xl font-bold text-main">GHC {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="p-2 bg-warning-light rounded-lg text-warning" style={{ backgroundColor: 'var(--warning-light)', color: '#d97706', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <AlertCircle size={24} />
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-success" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-sm font-medium text-secondary mb-1">Total Paid</p>
                            <h3 className="text-2xl font-bold text-main">GHC {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="p-2 bg-success-light rounded-lg text-success" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-primary" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
                    <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p className="text-sm font-medium text-secondary mb-1">Pending/Partial Audits</p>
                            <h3 className="text-2xl font-bold text-main">{pendingCount} Records</h3>
                        </div>
                        <div className="p-2 bg-primary-light rounded-lg text-primary" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="text-xl font-bold text-main" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Audit Fee Table</h2>
                <button
                    onClick={() => navigate('/reports')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                    <BarChart2 size={16} /> Generate Report
                </button>
            </div>

            <AuditFeeTable onProcessPayment={handleProcessPayment} />

            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedRecord(null); }}
                record={selectedRecord}
                onPay70={handlePay70}
                onPay30={handlePay30}
                onUnpay70={handleUnpay70}
                onUnpay30={handleUnpay30}
            />
        </DashboardLayout>
    );
};

export default Dashboard;
