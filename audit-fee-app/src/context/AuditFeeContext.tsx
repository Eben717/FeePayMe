import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AuditFeeRecord } from '../types/AuditFee';
import { initialMockData } from '../data/mockData';

interface AuditFeeContextType {
    fees: AuditFeeRecord[];
    pay70Percent: (id: string) => void;
    pay30Percent: (id: string) => void;
}

const AuditFeeContext = createContext<AuditFeeContextType | undefined>(undefined);

export const AuditFeeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [fees, setFees] = useState<AuditFeeRecord[]>(initialMockData);

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

    return (
        <AuditFeeContext.Provider value={{ fees, pay70Percent, pay30Percent }}>
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
