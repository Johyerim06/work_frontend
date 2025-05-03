import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import SearchSchool from './SearchSchool';
import OneTeacherInsert from '../component/OneTeacherInsert.tsx';

const today = dayjs().format("YYYY-MM-DD");

// 지역 이름 줄임표 변환 규칙
const regionRules: { pattern: RegExp; value: string }[] = [
  { pattern: /충청북도/, value: '충북' },
  { pattern: /경상북도/, value: '경북' },
  { pattern: /대구광역시|대구/, value: '대구' },
  { pattern: /전라남도/, value: '전남' },
  { pattern: /서울특별시|서울/, value: '서울' },
  { pattern: /대전광역시|대전/, value: '대전' },
  { pattern: /충청남도/, value: '충남' },
  { pattern: /경기도/, value: '경기' },
  { pattern: /전라북도|전북특별자치도/, value: '전북' },
  { pattern: /제주도|제주특별자치도/, value: '제주' },
  { pattern: /경상남도/, value: '경남' },
  { pattern: /인천광역시|인천/, value: '인천' },
  { pattern: /광주광역시|광주/, value: '광주' },
  { pattern: /강원도|강원특별자치도/, value: '강원' },
  { pattern: /부산광역시|부산/, value: '부산' },
  { pattern: /울산광역시|울산/, value: '울산' },
];

// 주소에서 region, city 추출
function extractRegionAndCity(address: string) {
  const parts = address.split(' ');
  if (parts.length < 2) return { region: '', city: '' };

  const fullRegion = parts[0];
  const fullCity = parts[1];

  let region = fullRegion;
  for (const rule of regionRules) {
    if (rule.pattern.test(fullRegion)) {
      region = rule.value;
      break;
    }
  }

  const city = fullCity.replace(/(시|군|구)$/, '');

  return { region, city };
}

export default function QuoteForm() {
  const [form, setForm] = useState({
    schoolName: '',
    region: '',
    city: '',
    teacher: '',
    phone: '',
    email: '',
    startDate: '',
    endDate: '',
    months: '',
    peopleCount: '',
    amount: '', // 텍스트 형식으로
    totalAmount: 0,
    quoteDate: today,
    note: '',
    totalAmountEdited: false,
  });

  // 학교 선택 시 자동 채우기
  const handleSelectSchool = (school: any) => {
    const address = school?.ORG_RDNMA || '';
    const { region, city } = extractRegionAndCity(address);

    setForm((prev) => ({
      ...prev,
      schoolName: school?.SCHUL_NM || '',
      region,
      city,
    }));
  };

  // 개월 수 자동 계산
  useEffect(() => {
    const { startDate, endDate } = form;
    if (startDate && endDate) {
      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const months = end.diff(start, 'month') + 1;
      if (months > 0) {
        setForm((prev) => ({ ...prev, months: String(months) }));
      }
    }
  }, [form.startDate, form.endDate]);

  // 총 금액 자동 계산
  useEffect(() => {
    const { amount, peopleCount, months } = form;
    const amt = parseInt((amount || '0').toString().replace(/,/g, ''), 10);
    const pc = parseInt(peopleCount || '0', 10);
    const mo = parseInt(months || '0', 10);
    const calculated = amt * pc * mo;

    if (!isNaN(calculated)) {
      setForm((prev) => ({
        ...prev,
        totalAmount: prev.totalAmountEdited ? prev.totalAmount : calculated,
      }));
    }
  }, [form.amount, form.peopleCount, form.months]);

  // 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (["amount", "peopleCount", "totalAmount"].includes(name)) {
      if (name === 'amount') {
        setForm((prev) => ({ ...prev, amount: value }));
      } else {
        const intValue = parseInt(value || '0', 10);
        setForm((prev) => ({
          ...prev,
          [name]: isNaN(intValue) ? 0 : intValue,
          ...(name === 'totalAmount' && { totalAmountEdited: true })
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 저장
  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:8080/api/contract/quote", form);
      alert("견적서 저장 완료!");
    } catch (err) {
      alert("저장 실패: " + err);
    }
  };

  return (
    <div>
      <h2>견적서 작성</h2>
      <div className="container">
        <SearchSchool onSelectSchool={handleSelectSchool} />
      </div>

      {[
        ['학교명', 'schoolName'],
        ['지역명', 'region'],
        ['시/군명', 'city'],
        ['교사명', 'teacher'],
        ['연락처', 'phone'],
        ['이메일', 'email'],
        ['사용 시작일', 'startDate'],
        ['사용 종료일', 'endDate'],
        ['개월 수', 'months'],
        ['인원 수', 'peopleCount'],
        ['월 사용료', 'amount'],
        ['총 계약금액', 'totalAmount'],
        ['견적일자', 'quoteDate'],
        ['비고', 'note'],
      ].map(([label, key]) => (
        <div key={key} style={{ marginBottom: '10px' }}>
          <label>{label}:</label>
          {key === 'note' ? (
            <textarea
              name={key}
              value={form[key as keyof typeof form] as string}
              onChange={handleChange}
              style={{ marginLeft: '10px', width: '300px', height: '100px' }}
            />
          ) : (
            <input
              type={
                key.includes('Date') ? 'date' :
                ['peopleCount', 'totalAmount'].includes(key) ? 'number' :
                'text'
              }
              name={key}
              value={form[key as keyof typeof form] as string | number}
              onChange={handleChange}
              style={{ marginLeft: '10px' }}
            />
          )}
        </div>
      ))}

      <button onClick={handleSubmit}>저장하기</button>

      <OneTeacherInsert
          teacher={form.teacher}
          email={form.email}
          phone={form.phone}
      />

    </div>
  );
}
