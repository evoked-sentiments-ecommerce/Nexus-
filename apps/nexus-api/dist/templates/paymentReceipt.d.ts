export interface PaymentReceiptData {
    customerName: string;
    customerEmail: string;
    invoiceId: string;
    planName: string;
    amount: number;
    currency: string;
    paidAt: Date;
    billingPeriodStart?: Date;
    billingPeriodEnd?: Date;
    receiptUrl?: string;
}
export declare function paymentReceiptSubject(data: PaymentReceiptData): string;
export declare function paymentReceiptHtml(data: PaymentReceiptData): string;
export declare function paymentReceiptText(data: PaymentReceiptData): string;
//# sourceMappingURL=paymentReceipt.d.ts.map