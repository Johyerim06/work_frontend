import React, { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import QuoteSchoolSearch from '../component/QuoteSchoolSearch'; // 자동완성 컴포넌트

interface SchoolItem {
    schoolName: string;
    email: string;
    studentCount: number;
    amount: number;
    quoteDate: string;
    taxInvoiceDate?: string;
    issued: boolean;
}

export default function TaxInvoiceForm() {
    const [form, setForm] = useState({
        businessNumber: '',
        businessName: '',
        ceoName: '',
        address: '',
        email1: '',
        email2: '',
        amount: 0,
        writeDate: dayjs().format('YYYY-MM-DD'),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const autoFormatBusinessNumber = (value: string) => {
        return value.replace(/[^0-9]/g, '').slice(0, 10);
    };

    const handleSubmit = async () => {
        try {
            const res = await axios.post('/api/tax-invoice/generate', {
                ...form,
                writeDate: dayjs(form.writeDate).toDate(), // 문자열을 Date 객체로 변환
            });
            alert(res.data);
        } catch (err) {
            alert('세금계산서 발급 실패');
            console.error(err);
        }
    };

    return (
        <div className="p-4 rounded-xl shadow bg-white w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">세금계산서 발급 입력</h2>

            {/* ✅ 학교 자동완성 검색 */}
            <QuoteSchoolSearch
                onSelect={(school: SchoolItem) => {
                    setForm((prev) => ({
                        ...prev,
                        businessName: school.schoolName,
                        email1: school.email,
                        amount: school.amount,
                    }));
                }}
                filter={(school: SchoolItem) => {
                    const oneYearAgo = dayjs().subtract(1, 'year');
                    return dayjs(school.quoteDate).isAfter(oneYearAgo);
                }}
            />

            {/* ✅ 입력 필드들 */}
            <div className="mb-2">
                <label className="block mb-1">사업자등록번호 (숫자 10자리)</label>
                <input
                    name="businessNumber"
                    value={form.businessNumber}
                    onChange={(e) =>
                        setForm((prev) => ({
                            ...prev,
                            businessNumber: autoFormatBusinessNumber(e.target.value),
                        }))
                    }
                    className="w-full p-2 border rounded"
                    placeholder="0000000000"
                />
            </div>

            <div className="mb-2">
                <label className="block mb-1">사업자명</label>
                <input
                    name="businessName"
                    value={form.businessName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-2">
                <label className="block mb-1">대표자명</label>
                <input
                    name="ceoName"
                    value={form.ceoName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-2">
                <label className="block mb-1">주소 (선택)</label>
                <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-2">
                <label className="block mb-1">이메일 1</label>
                <input
                    name="email1"
                    value={form.email1}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-2">
                <label className="block mb-1">이메일 2 (선택)</label>
                <input
                    name="email2"
                    value={form.email2}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-2">
                <label className="block mb-1">발행 금액</label>
                <input
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mb-2">
                <label className="block mb-1">작성일자</label>
                <input
                    name="writeDate"
                    type="date"
                    value={form.writeDate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    엑셀 기입 & 다운
                </button>
            </div>
        </div>
    );
}
