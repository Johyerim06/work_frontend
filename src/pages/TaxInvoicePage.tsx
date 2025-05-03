// ✅ pages/TaxInvoicePage.tsx

import React from 'react';
import TaxInvoiceForm from '../component/TaxInvoiceForm';

export default function TaxInvoicePage() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-2xl font-bold mb-6">세금계산서 발행</h1>
            <TaxInvoiceForm />
        </div>
    );
}
