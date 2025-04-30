import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

interface SearchSchoolProps {
  onSelectSchool: (school: any) => void;
}

const InputContainer = styled.div`
  margin-top: 2rem;
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
  padding: 1rem;
  border: 1px solid rgb(223, 225, 229);
  border-radius: 1rem;
  z-index: 3;
  position: relative;

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

const DropDownContainer = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid rgb(223, 225, 229);
  border-top: none;
  border-radius: 0 0 1rem 1rem;
  box-shadow: 0 4px 6px rgb(32 33 36 / 28%);
  z-index: 5;
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
    color: black;

    &:hover {
      background-color: #f5f5f5;
    }
  }
`;

const SchoolInfoBox = styled.div`
  position: relative;
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 1rem;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  color: black;

  .close-button {
    position: absolute;
    top: 10px;
    right: 14px;
    cursor: pointer;
    font-size: 20px;
    color: gray;

    &:hover {
      color: black;
    }
  }
`;

export default function SearchSchool({ onSelectSchool }: SearchSchoolProps) {
  const [searchText, setSearchText] = useState('');
  const [filteredSchools, setFilteredSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredSchools([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSchoolList(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchSchoolList = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:8080/api/schools`, {
        params: { name: query },
        withCredentials: true,
      });

      const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      const schoolList = parsedData.schoolInfo?.[1]?.row || [];
      setFilteredSchools(schoolList);
    } catch (error) {
      console.error('학교 검색 실패:', error);
      setFilteredSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setHighlightIndex(-1);
  };

  const handleDelete = () => {
    setSearchText('');
    setFilteredSchools([]);
    setHighlightIndex(-1);
  };

  const handleSchoolClick = (school: any) => {
    setSelectedSchool(school);
    setSearchText('');
    setFilteredSchools([]);
    setHighlightIndex(-1);
    onSelectSchool(school);
  };

  const handleClearSelectedSchool = () => {
    setSelectedSchool(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredSchools.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filteredSchools.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? filteredSchools.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      const selected = filteredSchools[highlightIndex];
      handleSchoolClick(selected);
    }
  };

  return (
    <div className="autocomplete-wrapper">
      <h1 style={{ color: 'white' }}>학교 검색</h1>

      <InputContainer>
        <input
          type="text"
          placeholder="학교 이름 입력하세요"
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {searchText && <div className="delete-button" onClick={handleDelete}>&times;</div>}

        {searchText.trim() !== '' && (
          <DropDownContainer>
            {isLoading ? (
              <li>검색 중...</li>
            ) : filteredSchools.length === 0 ? (
              <li style={{ color: 'gray' }}>검색 결과 없음</li>
            ) : (
              filteredSchools.map((school, index) => {
                const address = school.ORG_RDNMA || '';
                const parts = address.split(' ');
                const location = parts.length >= 2 ? `${parts[0]} ${parts[1]}` : school.LCTN_SC_NM;

                const isHighlighted = index === highlightIndex;

                return (
                  <li
                    key={school.SCHUL_NM}
                    onClick={() => handleSchoolClick(school)}
                    style={{
                      backgroundColor: isHighlighted ? '#f0f0f0' : undefined,
                      fontWeight: isHighlighted ? 'bold' : 'normal',
                    }}
                  >
                    <span>{school.SCHUL_NM}</span>
                    <span style={{ fontSize: '12px' }}>{location}</span>
                  </li>
                );
              })
            )}
          </DropDownContainer>
        )}
      </InputContainer>

      {selectedSchool && (
        <SchoolInfoBox>
          <div className="close-button" onClick={handleClearSelectedSchool}>&times;</div>
          <h2>{selectedSchool.SCHUL_NM}</h2>
          <p><strong>소재지:</strong> {selectedSchool.ORG_RDNMA || '정보 없음'}</p>
          <p><strong>전화번호:</strong> {selectedSchool.ORG_TELNO || '정보 없음'}</p>
          <p>
            <strong>홈페이지:</strong>{' '}
            {selectedSchool.HMPG_ADRES ? (
              <a href={selectedSchool.HMPG_ADRES} target="_blank" rel="noopener noreferrer">
                {selectedSchool.HMPG_ADRES}
              </a>
            ) : (
              '정보 없음'
            )}
          </p>
        </SchoolInfoBox>
      )}
    </div>
  );
}
