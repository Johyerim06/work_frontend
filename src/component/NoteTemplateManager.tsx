import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface NoteTemplate {
    id?: string;
    name: string;
    content: string;
}

export default function NoteTemplateManager({
                                                onSelectTemplate,
                                            }: {
    onSelectTemplate?: (note: string) => void;
}) {
    const [templates, setTemplates] = useState<NoteTemplate[]>([]);
    const [newTemplate, setNewTemplate] = useState<NoteTemplate>({ name: '', content: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedContent, setSelectedContent] = useState<string>(''); // ★ 선택된 템플릿 내용

    const fetchTemplates = async () => {
        const res = await axios.get('/api/note-templates');
        setTemplates(res.data);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSave = async () => {
        if (editingId) {
            await axios.put(`/api/note-templates/${editingId}`, newTemplate);
        } else {
            await axios.post('/api/note-templates', newTemplate);
        }
        setNewTemplate({ name: '', content: '' });
        setEditingId(null);
        setShowForm(false);
        fetchTemplates();
    };

    const handleEdit = (template: NoteTemplate) => {
        setNewTemplate(template);
        setEditingId(template.id || '');
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        await axios.delete(`/api/note-templates/${id}`);
        fetchTemplates();
    };

    const handleSelect = (content: string) => {
        setSelectedContent(content);
        onSelectTemplate?.(content); // 상위 컴포넌트로 전달
    };

    return (
        <div>
            <h3>비고 템플릿</h3>
            <button onClick={() => {
                setShowForm(!showForm);
                setNewTemplate({ name: '', content: '' });
                setEditingId(null);
            }}>
                {showForm ? '취소' : '추가'}
            </button>

            {showForm && (
                <div style={{ marginTop: '10px' }}>
                    <div>
                        템플릿 이름: <input
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    />
                    </div>
                    <div>
            <textarea
                rows={5}
                cols={50}
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
            />
                    </div>
                    <button onClick={handleSave}>저장</button>
                </div>
            )}

            <table style={{ marginTop: '20px', borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    <th>선택</th>
                    <th>템플릿 이름</th>
                    <th>미리보기</th>
                    <th>수정</th>
                    <th>삭제</th>
                </tr>
                </thead>
                <tbody>
                {templates.map((t) => (
                    <tr key={t.id}>
                        <td>
                            <input
                                type="radio"
                                name="noteTemplateSelect"
                                checked={selectedContent === t.content}
                                onChange={() => handleSelect(t.content)}
                            />
                        </td>
                        <td>{t.name}</td>
                        <td>{t.content.slice(0, 10)}</td>
                        <td><button onClick={() => handleEdit(t)}>수정</button></td>
                        <td><button onClick={() => handleDelete(t.id!)}>삭제</button></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
