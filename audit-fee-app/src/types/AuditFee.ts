export type PaymentStatus = 'Pending' | '70% Paid' | 'Fully Paid';

export interface AuditFeeRecord {
    id: string; // unique identifier
    auditMonth: string;
    auditPeriod: string;
    auditorName: string;
    project: string;
    serviceDescription: string;
    auditType: string;
    announcedUnannounced: string;
    auditStartDate?: string; // New field for Audit Start Date
    tonnageHours?: string;
    standard: string;
    locationType: 'Local' | 'Foreign';
    auditLocation: string;

    auditRate: number;
    travelRate: number;
    actualAuditDays: number;
    actualTravelDays: number;
    reportingDays: number;
    sampleDays: number;
    totalNoDays: number;

    totalAmountDue: number;
    roe: number;
    contractNum: string;
    cediEquivalent: number;
    whtRate: number; // Percentage like 7.5
    withholdingTax: number;
    netPay: number; // This is the final amount payable

    // Payment Tracking
    certified?: boolean;
    payment70Status: 'Pending' | 'Paid';
    payment30Status: 'Pending' | 'Paid';
    paymentStatus: PaymentStatus;
    paymentDate?: string;
}
