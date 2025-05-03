import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface FileItem {
    id: string;
    fileName: string;
    customName: string;
    extension: string;
    uploadTime: string;
    validUntil: string;
}

export default function FileList() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const fetchFiles = async () => {
        try {
            const response = await axios.get<FileItem[]>('http://localhost:8080/api/files/list');
            setFiles(response.data);
        } catch (error) {
            console.error('파일 목록 가져오기 실패:', error);
        }
    };

    const handleDelete = async (id: string) => {
        const confirm = window.confirm('정말 삭제하시겠습니까?');
        if (!confirm) return;

        try {
            await axios.delete(`http://localhost:8080/api/files/delete/${id}`);
            fetchFiles();
        } catch (error) {
            alert('삭제 실패');
            console.error('삭제 오류:', error);
        }
    };

    const handleCustomNameChange = (id: string, value: string) => {
        setFiles(prev =>
            prev.map(file => file.id === id ? { ...file, customName: value } : file)
        );
    };

    const handleSaveCustomName = async (id: string, customName: string) => {
        try {
            await axios.patch(`http://localhost:8080/api/files/update-name/${id}?customName=${encodeURIComponent(customName)}`);
            alert('지정 파일명 저장 성공');
        } catch (e) {
            alert('지정 파일명 저장 실패');
        }
    };

    const handleValidUntilChange = (id: string, value: string) => {
        setFiles(prev =>
            prev.map(file => file.id === id ? { ...file, validUntil: value } : file)
        );
    };

    const handleSaveValidUntil = async (id: string, validUntil: string) => {
        try {
            await axios.patch(`http://localhost:8080/api/files/update-valid-until/${id}?validUntil=${encodeURIComponent(validUntil)}`);
            alert('유효기간 저장 성공');
        } catch (e) {
            alert('유효기간 저장 실패');
        }
    };

    const formatExtension = (ext: string) => {
        return ext ? ext.toUpperCase() : '';
    };

    // 파일 저장 버튼 클릭 → input[type=file] 클릭 유도
    const handleFileSaveClick = () => {
        fileInputRef.current?.click();
    };

    // 파일 선택됨
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // 파일 업로드
    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await axios.post('http://localhost:8080/api/files/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('업로드 성공');
            setSelectedFile(null); // 선택 초기화
            fetchFiles(); // 목록 새로고침
        } catch (err) {
            alert('업로드 실패');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    return (
        <div style={{ width: '100%' }}>
            {/* 상단 버튼 영역 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                    {!selectedFile ? (
                        <button onClick={handleFileSaveClick}>📁 파일 저장</button>
                    ) : (
                        <button onClick={handleUpload}>⬆️ 업로드</button>
                    )}
                    {selectedFile && (
                        <span style={{ marginLeft: '10px', fontStyle: 'italic' }}>
                            선택된 파일: {selectedFile.name}
                        </span>
                    )}
                </div>
                <button onClick={() => alert('추후 구현: 선택한 파일을 메일에 첨부')}>📧 메일 첨부</button>
            </div>

            {/* 테이블 영역 */}
            <table border={1} style={{ width: '100%', textAlign: 'left' }}>
                <thead>
                <tr>
                    <th>선택</th>
                    <th>지정 파일명</th>
                    <th>실제 파일명</th>
                    <th>확장자</th>
                    <th>업로드 시간</th>
                    <th>유효기간</th>
                    <th>삭제</th>
                </tr>
                </thead>
                <tbody>
                {files.map(file => (
                    <tr key={file.id}>
                        <td><input type="checkbox" /></td>
                        <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                    value={file.customName || ''}
                                    onChange={(e) => handleCustomNameChange(file.id, e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button onClick={() => handleSaveCustomName(file.id, file.customName)}>저장</button>
                            </div>
                        </td>
                        <td>{file.fileName}</td>
                        <td>{formatExtension(file.extension)}</td>
                        <td>{file.uploadTime}</td>
                        <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <input
                                    type="date"
                                    value={file.validUntil || ''}
                                    onChange={(e) => handleValidUntilChange(file.id, e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button onClick={() => handleSaveValidUntil(file.id, file.validUntil)}>저장</button>
                            </div>
                        </td>
                        <td>
                            <button onClick={() => handleDelete(file.id)}>삭제</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
