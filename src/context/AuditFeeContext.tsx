import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AuditFeeRecord } from '../types/AuditFee';

const LOCAL_STORAGE_KEY = 'feePayMe_auditFees_state';

interface AuditFeeContextType {
    fees: AuditFeeRecord[];
    pay70Percent: (id: string) => void;
    pay30Percent: (id: string) => void;
    unpay70Percent: (id: string) => void;
    unpay30Percent: (id: string) => void;
    addFee: (fee: Omit<AuditFeeRecord, 'id' | 'paymentStatus' | 'payment70Status' | 'payment30Status' | 'cediEquivalent' | 'withholdingTax' | 'netPay'>) => void;
    removeFee: (id: string) => void;
    updateFee: (id: string, updates: Partial<AuditFeeRecord>) => void;
}

const AuditFeeContext = createContext<AuditFeeContextType | undefined>(undefined);

const applyAutoCalculations = (fee: AuditFeeRecord): AuditFeeRecord => {
    const cediEquivalent = fee.totalAmountDue * fee.roe;
    const withholdingTax = cediEquivalent * (fee.whtRate / 100);
    const netPay = cediEquivalent - withholdingTax;

    return {
        ...fee,
        cediEquivalent,
        withholdingTax,
        netPay
    };
};

export const AuditFeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [fees, setFees] = useState<AuditFeeRecord[]>(() => {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData) as AuditFeeRecord[];
                return parsed.map(applyAutoCalculations);
            } catch (e) {
                console.error('Failed to parse fees from localStorage:', e);
            }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fees));
    }, [fees]);

    const pay70Percent = (id: string) => {
        setFees(prevFees => prevFees.map(fee => {
            if (fee.id === id && fee.paymentStatus === 'Pending') {
                return {
                    ...fee,
                    payment70Status: 'Paid',
                    paymentStatus: '70% Paid' as const,
                    paymentDate: new Date().toLocaleDateString('en-GB')
                };
            }
            return fee;
        }));
    };

    const pay30Percent = (id: string) => {
        setFees(prevFees => prevFees.map(fee => {
            // Must have already been paid 70% to pay the remaining 30%
            if (fee.id === id && fee.paymentStatus === '70% Paid') {
                return {
                    ...fee,
                    payment30Status: 'Paid',
                    paymentStatus: 'Fully Paid' as const,
                    paymentDate: new Date().toLocaleDateString('en-GB')
                };
            }
            return fee;
        }));
    };

    const unpay70Percent = (id: string) => {
        setFees(prevFees => prevFees.map(fee => {
            // Can only unpay 70% if 30% has not been paid
            if (fee.id === id && fee.paymentStatus === '70% Paid') {
                return {
                    ...fee,
                    payment70Status: 'Pending',
                    paymentStatus: 'Pending' as const,
                    paymentDate: undefined
                };
            }
            return fee;
        }));
    };

    const unpay30Percent = (id: string) => {
        setFees(prevFees => prevFees.map(fee => {
            if (fee.id === id && fee.paymentStatus === 'Fully Paid') {
                return {
                    ...fee,
                    payment30Status: 'Pending',
                    paymentStatus: '70% Paid' as const,
                    // Keep the original 70% payment date or set it to a new one if needed, but for now we won't clear it.
                };
            }
            return fee;
        }));
    };

    const addFee = (feeInput: Omit<AuditFeeRecord, 'id' | 'paymentStatus' | 'payment70Status' | 'payment30Status' | 'cediEquivalent' | 'withholdingTax' | 'netPay'>) => {
        const newFee: AuditFeeRecord = {
            ...feeInput,
            id: Date.now().toString(),
            paymentStatus: 'Pending',
            payment70Status: 'Pending',
            payment30Status: 'Pending',
            // Default calculated values (will be overwritten by applyAutoCalculations)
            cediEquivalent: 0,
            withholdingTax: 0,
            netPay: 0,
        };

        setFees(prevFees => [applyAutoCalculations(newFee), ...prevFees]);
    };

    const removeFee = (id: string) => {
        setFees(prevFees => prevFees.filter(fee => fee.id !== id));
    };

    const updateFee = (id: string, updates: Partial<AuditFeeRecord>) => {
        setFees(prevFees => prevFees.map(fee => {
            if (fee.id === id) {
                return applyAutoCalculations({ ...fee, ...updates });
            }
            return fee;
        }));
    };

    return (
        <AuditFeeContext.Provider value={{ fees, pay70Percent, pay30Percent, unpay70Percent, unpay30Percent, addFee, removeFee, updateFee }}>
            {children}
        </AuditFeeContext.Provider>
    );
};

export const useAuditFees = () => {
    const context = useContext(AuditFeeContext);
    if (context === undefined) {
        throw new Error('useAuditFees must be used within an AuditFeeProvider');
    }
    return context;
};
