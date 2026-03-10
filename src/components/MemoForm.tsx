'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Trash2, X, Plus, Check } from 'lucide-react';
import { Tabs, Card, CardContent, Button, Input } from '@/components/ui';

interface MemoEntry {
    id: string;
    date: string;
    content: string;
    photoUrl?: string;
    created_at?: string;
}

interface TaskEntry {
    id: string;
    content: string;
    done: boolean;
    created_at?: string;
}

const QUICK_TAGS = [
    { icon: '🍂', label: '거름', text: '과수원 밑거름(퇴비) 살포 작업 진행.' },
    { icon: '✂️', label: '전정', text: '웃자란 가지 전정(가지치기) 진행.' },
    { icon: '🌳', label: '식재', text: '사과나무 묘목 식재 작업 진행.' },
    { icon: '💊', label: '방제/농약', text: '병해충 방제 작업 진행함.' },
    { icon: '🌿', label: '제초', text: '과수원 잡초 제거(제초) 작업 진행.' },
    { icon: '🌱', label: '비료', text: '웃거름 살포 작업 진행.' },
    { icon: '💧', label: '물주기', text: '과수원 전체 관수 작업 진행.' },
    { icon: '🌸', label: '적화', text: '불필요한 꽃눈 제거(적화) 작업 진행.' },
    { icon: '🍏', label: '적과', text: '불량 및 과다 열매 솎아내기(적과) 진행.' },
    { icon: '🍃', label: '적엽', text: '햇빛을 가리는 잎따기(적엽) 작업 진행.' },
    { icon: '🍎', label: '수확', text: '사과 수확 및 선별 작업 중.' },
    { icon: '📦', label: '포장/출하', text: '주문 건 포장 및 택배 발송 처리.' },
    { icon: '🧃', label: '가공', text: '사과즙 등 가공품 생산 작업 진행.' },
];

export default function MemoForm() {
    const [memos, setMemos] = useState<MemoEntry[]>([]);
    const [content, setContent] = useState('');
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 상세/수정 모달
    const [selectedMemo, setSelectedMemo] = useState<MemoEntry | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

    // 서브 탭
    const [activeTab, setActiveTab] = useState('todo');

    // 할일 상태
    const [tasks, setTasks] = useState<TaskEntry[]>([]);
    const [newTask, setNewTask] = useState('');
    const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    // ── 데이터 로드 ──
    const fetchMemos = useCallback(async () => {
        const { data } = await supabase.from('memos').select('*').order('created_at', { ascending: false });
        if (data) {
            setMemos(data.map((item: any) => ({
                id: String(item.id),
                date: item.date || '',
                content: item.content || '',
                photoUrl: item.photo_url || undefined,
                created_at: item.created_at,
            })));
        }
    }, []);

    const fetchTasks = useCallback(async () => {
        const { data } = await supabase.from('tasks').select('*').order('done', { ascending: true }).order('created_at', { ascending: false });
        if (data) setTasks(data);
    }, []);

    useEffect(() => {
        (async () => { setIsLoading(true); await Promise.all([fetchMemos(), fetchTasks()]); setIsLoading(false); })();
    }, [fetchMemos, fetchTasks]);

    // ── 빠른 입력 태그 ──
    const handleQuickTag = (tagText: string) => {
        setContent(prev => prev.trim().length > 0 ? prev.trim() + '\n' + tagText : tagText);
    };
    const handleQuickTaskTag = (tagText: string) => setNewTask(tagText);

    // ── 사진 처리 ──
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setPhotoFiles(prev => [...prev, ...files]);
        files.forEach(f => {
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreviewUrls(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(f);
        });
    };

    const removePhoto = (idx: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== idx));
        setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== idx));
    };

    const uploadPhoto = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('photo', file);
            const res = await fetch('https://apple-farm-138.pages.dev/api/upload', { method: 'POST', body: formData });
            if (res.ok) { const data = await res.json(); return data.url || null; }
            return null;
        } catch { return null; }
    };

    // ── 일지 저장 ──
    const handleSubmit = async () => {
        if (!content.trim()) return alert('일지 내용을 입력해주세요.');
        setIsSubmitting(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of photoFiles) {
                const url = await uploadPhoto(file);
                if (url) uploadedUrls.push(url);
            }
            const { error } = await supabase.from('memos').insert([{
                date: today, content: content.trim(),
                photo_url: uploadedUrls.length > 0 ? uploadedUrls.join(',') : null,
            }]);
            if (error) return alert('저장 실패: ' + error.message);
            setContent(''); setPhotoFiles([]); setPhotoPreviewUrls([]);
            await fetchMemos();
            alert('영농일지가 저장되었습니다.');
        } catch (err: any) { alert('오류: ' + err.message); }
        finally { setIsSubmitting(false); }
    };

    // ── 일지 수정 ──
    const handleUpdate = async () => {
        if (!selectedMemo || !editContent.trim()) return;
        const { error } = await supabase.from('memos').update({ content: editContent.trim() }).eq('id', selectedMemo.id);
        if (error) return alert('수정 실패: ' + error.message);
        setIsEditing(false); setSelectedMemo(null); await fetchMemos();
    };

    // ── 일지 삭제 ──
    const handleDelete = async () => {
        if (!selectedMemo || !confirm('이 영농일지를 정말 삭제하시겠습니까?')) return;
        const { error } = await supabase.from('memos').delete().eq('id', selectedMemo.id);
        if (error) return alert('삭제 실패: ' + error.message);
        setSelectedMemo(null); await fetchMemos();
    };

    // ── 할일 CRUD ──
    const addTask = async () => {
        if (!newTask.trim()) return alert('할일 내용을 입력해주세요.');
        setIsTaskSubmitting(true);
        const { error } = await supabase.from('tasks').insert([{ content: newTask.trim(), done: false }]);
        if (!error) { setNewTask(''); await fetchTasks(); }
        setIsTaskSubmitting(false);
    };

    const toggleTask = async (task: TaskEntry) => {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !task.done } : t));
        await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id);
    };

    const deleteTask = async (id: string) => {
        if (!confirm('이 할일을 삭제하시겠습니까?')) return;
        await supabase.from('tasks').delete().eq('id', id);
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const deleteAllTasks = async () => {
        if (tasks.length === 0) return alert('삭제할 할 일이 없습니다.');
        if (!confirm('등록된 모든 할 일을 삭제하시겠습니까?')) return;
        await supabase.from('tasks').delete().in('id', tasks.map(t => t.id));
        setTasks([]);
    };

    return (
        <div className="space-y-4">
            {/* 서브 탭 */}
            <Tabs
                tabs={[
                    { id: 'todo', label: '📝 작업입력' },
                    { id: 'records', label: '📋 작업일지' },
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            {activeTab === 'todo' ? (
                <>
                    {/* ═══ 오늘 한일 작성 ═══ */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">📝 오늘 한일</h3>
                                <span className="text-sm text-gray-500 dark:text-gray-400">{today}</span>
                            </div>

                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="오늘 한 작업, 날씨, 메모 등을 자유롭게 기록하세요..."
                                className="w-full min-h-[140px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-y transition-colors"
                            />

                            {/* 빠른 입력 태그 */}
                            <div>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">⚡ 빠른 입력:</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {QUICK_TAGS.map((tag, idx) => (
                                        <button key={idx} onClick={() => handleQuickTag(tag.text)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        ><span>{tag.icon}</span>{tag.label}</button>
                                    ))}
                                </div>
                            </div>

                            {/* 사진 미리보기 */}
                            {photoPreviewUrls.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto py-2">
                                    {photoPreviewUrls.map((url, idx) => (
                                        <div key={idx} className="relative shrink-0">
                                            <img src={url} className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                                            <button onClick={() => removePhoto(idx)}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70"
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 사진 + 저장 버튼 */}
                            <div className="flex gap-3">
                                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                                <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex-1">🖼 사진 첨부</Button>
                                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                                    {isSubmitting ? '저장 중...' : '일지 저장하기'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ═══ 앞으로 할일 ═══ */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">✅ 앞으로 할일</h3>
                                <button onClick={deleteAllTasks} className="text-lg hover:opacity-70" title="전체 삭제">🗑️</button>
                            </div>

                            {/* 할일용 빠른 태그 */}
                            <div className="flex flex-wrap gap-2">
                                {QUICK_TAGS.map((tag, idx) => (
                                    <button key={`task-${idx}`} onClick={() => handleQuickTaskTag(tag.text)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    ><span>{tag.icon}</span>{tag.label}</button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    value={newTask}
                                    onChange={e => setNewTask(e.target.value)}
                                    placeholder="단기 작업이나 할 일을 기록하세요..."
                                    onKeyDown={e => e.key === 'Enter' && addTask()}
                                    className="flex-1"
                                />
                                <Button variant="primary" onClick={addTask} disabled={isTaskSubmitting}>
                                    {isTaskSubmitting ? '...' : '추가'}
                                </Button>
                            </div>

                            {tasks.length > 0 ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {tasks.map(task => (
                                        <div key={task.id} className="flex items-center gap-3 py-3 group">
                                            <button onClick={() => toggleTask(task)}
                                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${task.done ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 dark:border-gray-600'
                                                    }`}
                                            >{task.done && <Check className="w-3.5 h-3.5" />}</button>
                                            <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.content}</span>
                                            <button onClick={() => deleteTask(task.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 transition-all"
                                            ><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">등록된 할 일이 없습니다.</p>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <>
                    {/* ═══ 작업일지 탭 (기록 목록) ═══ */}
                    {isLoading ? (
                        <div className="flex flex-col items-center py-20 gap-4">
                            <span className="animate-spin w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full" />
                            <p className="text-gray-500 dark:text-gray-400">일지를 불러오는 중...</p>
                        </div>
                    ) : memos.length > 0 ? (
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">📋 기록된 일지 ({memos.length}건)</h3>
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {memos.map(memo => (
                                        <div key={memo.id} className="py-4">
                                            <button onClick={() => { setSelectedMemo(memo); setEditContent(memo.content); setIsEditing(false); }}
                                                className="text-left w-full hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -m-2 transition-colors"
                                            >
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{memo.date}</span>
                                                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 line-clamp-3 whitespace-pre-wrap">{memo.content}</p>
                                            </button>
                                            {memo.photoUrl && (
                                                <div className="flex gap-2 overflow-x-auto mt-2">
                                                    {memo.photoUrl.split(',').map((url, idx) => (
                                                        <button key={idx} onClick={() => { setSelectedMemo(memo); setEditContent(memo.content); setIsEditing(false); }}>
                                                            <img src={url.trim().startsWith('/') ? `https://apple-farm-138.pages.dev${url.trim()}` : url.trim()}
                                                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shrink-0" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <span className="text-4xl block mb-3">🌿</span>
                                <p className="text-gray-400 dark:text-gray-500">아직 기록된 일지가 없습니다</p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* ═══ 일지 상세/수정 모달 ═══ */}
            {selectedMemo && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setSelectedMemo(null)}>
                    <div className="bg-white dark:bg-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* 헤더 */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-gray-200">일지 상세내역</h3>
                                <span className="text-xs text-gray-500">{selectedMemo.date}</span>
                            </div>
                            <button onClick={() => setSelectedMemo(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* 이미지 */}
                            {selectedMemo.photoUrl && (
                                <div className="flex gap-3 overflow-x-auto">
                                    {selectedMemo.photoUrl.split(',').map((url, idx) => {
                                        const imgUrl = url.trim().startsWith('/') ? `https://apple-farm-138.pages.dev${url.trim()}` : url.trim();
                                        return (
                                            <button key={idx} onClick={() => setFullScreenImage(imgUrl)}>
                                                <img src={imgUrl} className="w-48 h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700 shrink-0" />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* 내용 */}
                            {isEditing ? (
                                <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                                    className="w-full min-h-[120px] rounded-lg border border-green-500 p-3 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-900 focus:outline-none resize-y"
                                    autoFocus
                                />
                            ) : (
                                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{selectedMemo.content}</p>
                            )}

                            {/* 버튼 */}
                            <div className="flex gap-3">
                                {isEditing ? (
                                    <>
                                        <Button variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>취소</Button>
                                        <Button variant="primary" className="flex-1" onClick={handleUpdate}>저장하기</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="secondary" className="flex-1" onClick={() => setIsEditing(true)}>✏️ 수정</Button>
                                        <Button variant="danger" className="flex-1" onClick={handleDelete}>🗑️ 삭제</Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ 전체화면 이미지 뷰어 ═══ */}
            {fullScreenImage && (
                <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center" onClick={() => setFullScreenImage(null)}>
                    <button onClick={() => setFullScreenImage(null)} className="absolute top-4 right-4 text-white text-2xl bg-black/50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80 z-10">✕</button>
                    <img src={fullScreenImage} className="max-w-full max-h-full object-contain" />
                </div>
            )}
        </div>
    );
}
