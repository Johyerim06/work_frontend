// src/components/OneTeacherInsert.tsx

import React, { useState } from 'react';
import axios from 'axios';

interface OneTeacherInsertProps {
    teacher: string;
    email: string;
    phone: string;
}

export default function OneTeacherInsert({ teacher, email, phone }: OneTeacherInsertProps) {
    const [type, setType] = useState<'대표교사' | '선생님'>('대표교사');

    const handleSave = async () => {
        const payload = {
            teacher,
            email,
            phone,
            type
        };

        try {
            await axios.post('http://localhost:8080/api/template/user-insert', payload);
            alert('양식 저장 완료!');
        } catch (err) {
            alert('저장 실패: ' + err);
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <label>교사 유형:</label>
            <select
                value={type}
                onChange={(e) => setType(e.target.value as '대표교사' | '선생님')}
                style={{ marginLeft: '10px', marginRight: '10px' }}
            >
                <option value="대표교사">대표교사</option>
                <option value="선생님">선생님</option>
            </select>
            <button onClick={handleSave}>양식 저장</button>
        </div>
    );
}
