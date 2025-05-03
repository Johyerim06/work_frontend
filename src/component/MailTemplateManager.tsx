import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

interface MailTemplate {
    id?: string;
    name: string;
    subject: string;
    content: string;
}

interface Props {
    onTemplateSelect?: (template: MailTemplate) => void;
}

export default function MailTemplateManager({ onTemplateSelect }: Props) {
    const [templates, setTemplates] = useState<MailTemplate[]>([]);
    const [editing, setEditing] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<MailTemplate>({
        name: '',
        subject: '',
        content: '',
    });

    const fetchTemplates = async () => {
        try {
            const res = await axios.get('/api/templates/list');
            setTemplates(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('템플릿 불러오기 실패', err);
        }
    };

    const saveTemplate = async () => {
        try {
            await axios.post('/api/templates/save', form);
            fetchTemplates();
            resetForm();
        } catch (err) {
            console.error('템플릿 저장 실패', err);
        }
    };

    const deleteTemplate = async (id: string) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await axios.delete(`/api/templates/delete/${id}`);
            fetchTemplates();
        } catch (err) {
            console.error('삭제 실패', err);
        }
    };

    const resetForm = () => {
        setEditing(false);
        setEditingId(null);
        setForm({ name: '', subject: '', content: '' });
    };

    const startEdit = (template: MailTemplate) => {
        setEditing(true);
        setEditingId(template.id || null);
        setForm(template);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h3>📋 메일 템플릿 목록</h3>
            <table border={1} cellPadding={10}>
                <thead>
                <tr>
                    <th>템플릿 이름</th>
                    <th>메일 제목</th>
                    <th>적용</th>
                    <th>수정</th>
                    <th>삭제</th>
                </tr>
                </thead>
                <tbody>
                {templates.length === 0 ? (
                    <tr>
                        <td colSpan={5}>저장된 템플릿이 없습니다.</td>
                    </tr>
                ) : (
                    templates.map((template) => (
                        <tr key={template.id}>
                            <td>{template.name}</td>
                            <td>{template.subject}</td>
                            <td>
                                <button onClick={() => onTemplateSelect?.(template)}>📩 적용</button>
                            </td>
                            <td>
                                <button onClick={() => startEdit(template)}>✏️ 수정</button>
                            </td>
                            <td>
                                <button onClick={() => deleteTemplate(template.id!)}>🗑️ 삭제</button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            <div style={{ marginTop: '30px' }}>
                {!editing ? (
                    <button onClick={() => setEditing(true)}>➕ 새 템플릿 만들기</button>
                ) : (
                    <div style={{ marginTop: '20px' }}>
                        <h3>{editingId ? '✏️ 템플릿 수정' : '🆕 새 템플릿 만들기'}</h3>
                        <div style={{ marginBottom: '10px' }}>
                            <label>템플릿 이름: </label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                style={{ width: '300px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>메일 제목: </label>
                            <input
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                style={{ width: '300px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <Editor
                                apiKey="ewuixwjyd18uqz81us6aynwb5yus2zm4haxxc9o3n02j0jkv"
                                value={form.content}
                                init={{
                                    height: 300,
                                    menubar: true,
                                    plugins: [
                                        'advlist',
                                        'autolink',
                                        'lists',
                                        'link',
                                        'image',
                                        'charmap',
                                        'preview',
                                        'anchor',
                                        'searchreplace',
                                        'visualblocks',
                                        'code',
                                        'fullscreen',
                                        'insertdatetime',
                                        'media',
                                        'table',
                                        'help',
                                        'wordcount',
                                        'textcolor', // ✅ 추가
                                    ],
                                    toolbar:
                                        'undo redo | formatselect | bold italic underline | ' +
                                        'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
                                        'bullist numlist outdent indent | removeformat | link image | code',
                                }}
                                onEditorChange={(newValue) =>
                                    setForm({ ...form, content: newValue })
                                }
                            />
                        </div>
                        <div>
                            <button onClick={saveTemplate}>💾 저장</button>
                            <button onClick={resetForm} style={{ marginLeft: '10px' }}>
                                ❌ 취소
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
