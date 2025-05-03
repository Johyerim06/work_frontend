import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import axios from 'axios';

const InputContainer = styled.div`
    background-color: #ffffff;
    display: flex;
    padding: 1rem;
    border: 1px solid rgb(223, 225, 229);
    border-radius: 1rem;
    position: relative;
    z-index: 10;

    &:focus-within {
        box-shadow: 0 4px 6px rgb(32 33 36 / 28%);
    }

    > input {
        flex: 1;
        background-color: transparent;
        border: none;
        outline: none;
        font-size: 16px;
        color: black;
    }

    > .delete-button {
        cursor: pointer;
        padding-left: 10px;
        font-size: 20px;
    }
`;

const DropDownWrapper = styled.div`
    position: relative;
    width: 100%;
`;

const DropDownContainer = styled.ul`
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background-color: #ffffff;
    border: 1px solid rgb(223, 225, 229);
    border-radius: 0 0 1rem 1rem;
    box-shadow: 0 4px 6px rgb(32 33 36 / 28%);
    z-index: 9999;
    max-height: 300px;
    overflow-y: auto;
    list-style: none;
    padding: 0;
    margin: 0;

    > li {
        padding: 10px 1rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: black;
        transition: background-color 0.2s;

        &.highlighted {
            background-color: #f5f5f5;
        }

        .school-name {
            font-weight: bold;
        }

        .school-meta {
            text-align: right;
            font-size: 0.875rem;
            color: #6b7280;
        }
    }
`;

const IssuedMark = styled.div`
    color: #2563eb;
    font-weight: 600;
    background-color: #e6f4ff;
    padding: 0.2rem 0.5rem;
    border-radius: 0.375rem;
    margin-top: 0.2rem;
`;

interface QuoteSchoolSearchProps {
    onSelect: (school: {
        schoolName: string;
        email: string;
        amount: number;
    }) => void;
    filter?: (school: any) => boolean;
    getLabel?: (school: any) => string; // ✅ 추가된 부분
}

export default function QuoteSchoolSearch({ onSelect, filter, getLabel }: QuoteSchoolSearchProps) {
    const [searchText, setSearchText] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (!searchText.trim()) {
                setFilteredOptions([]);
                return;
            }

            try {
                const res = await axios.get('/api/tax-invoice/school-list', {
                    params: { keyword: searchText },
                });

                const data = res.data;

                const finalFiltered = typeof filter === 'function'
                    ? data.filter(filter)
                    : data;

                setFilteredOptions(finalFiltered);
            } catch (err) {
                console.error('학교 리스트 검색 실패', err);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchText, filter]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            setActiveIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(filteredOptions[activeIndex]);
        }
    };

    const handleSelect = (school: any) => {
        onSelect(school);
        setSearchText(school.schoolName);
        setFilteredOptions([]);
        setActiveIndex(-1);
    };

    return (
        <div className="mb-4">
            <label className="block mb-1 font-semibold">학교 검색</label>
            <DropDownWrapper>
                <InputContainer>
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="학교명 입력"
                        ref={inputRef}
                    />
                    {searchText && (
                        <div className="delete-button" onClick={() => setSearchText('')}>
                            &times;
                        </div>
                    )}
                </InputContainer>

                {filteredOptions.length > 0 && (
                    <DropDownContainer>
                        {filteredOptions.map((school: any, idx: number) => (
                            <li
                                key={idx}
                                onClick={() => handleSelect(school)}
                                className={idx === activeIndex ? 'highlighted' : ''}
                            >
                                <span className="school-name">
                                    {getLabel ? getLabel(school) : school.schoolName}
                                </span>
                                <div className="school-meta">
                                    💰 {school.amount?.toLocaleString() ?? 0}원<br />
                                    🗓 {dayjs(school.quoteDate).format('YYYY.MM.DD')}
                                    {school.issued && (
                                        <IssuedMark>
                                            (발행 완료{school.taxInvoiceDate ? `: ${school.taxInvoiceDate}` : ''})
                                        </IssuedMark>
                                    )}
                                </div>
                            </li>
                        ))}
                    </DropDownContainer>
                )}
            </DropDownWrapper>
        </div>
    );
}
