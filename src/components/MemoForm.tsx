'use client';

import { useState, useRef } from 'react';
import { Leaf, Sun, Cloud, CloudRain, Snowflake, Edit2, Trash2, Camera, X } from 'lucide-react';

interface Memo {
    id: string;
    date: string;
    weather: string;
    content: string;
    photo?: string | null;
}

const WEATHER_OPTIONS = [
    { id: 'sunny', icon: Sun, label: '맑음', color: 'text-orange-500' },
    { id: 'cloudy', icon: Cloud, label: '흐림', color: 'text-gray-500' },
    { id: 'rainy', icon: CloudRain, label: '비', color: 'text-blue-500' },
    { id: 'snowy', icon: Snowflake, label: '눈', color: 'text-sky-300' },
];

const JOB_TAGS = ['✂️ 전정', '💧 관수', '🐛 방제', '🍎 수확', '🌱 시비', '🚜 제초', '🍂 낙엽 정리', '🛠️ 시설물 보수'];

export default function MemoForm() {
    const [memos, setMemos] = useState<Memo[]>([]);
    const [selectedWeather, setSelectedWeather] = useState<string>('sunny');
    const [content, setContent] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddTag = (tag: string) => {
        setContent((prev) => (prev ? `${prev} ${tag}` : tag));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const url = URL.createObjectURL(file);
            setPhotoUrl(url);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoUrl(null);
        setPhotoFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (!content.trim()) return;

        setIsUploading(true);
        let finalPhotoUrl = photoUrl;

        // 사진이 새로 업로드된 경우 API 호춯
        if (photoFile) {
            const formData = new FormData();
            formData.append('photo', photoFile);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    finalPhotoUrl = data.url;
                } else {
                    alert('사진 서버 업로드에 실패했습니다. (R2 연동 등 확인)');
                    setIsUploading(false);
                    return;
                }
            } catch (error) {
                console.error('Upload Error:', error);
                alert('사진 업로드 중 네트워크 오류가 발생했습니다.');
                setIsUploading(false);
                return;
            }
        }

        if (editingId) {
            setMemos(memos.map(memo =>
                memo.id === editingId
                    ? { ...memo, weather: selectedWeather, content, photo: finalPhotoUrl }
                    : memo
            ));
            setEditingId(null);
            setSelectedWeather('sunny');
            setContent('');
            setPhotoUrl(null);
            setPhotoFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setIsUploading(false);
            return;
        }

        const newMemo: Memo = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
            }),
            weather: selectedWeather,
            content,
            photo: finalPhotoUrl,
        };

        setMemos([newMemo, ...memos]);
        setSelectedWeather('sunny');
        setContent('');
        setPhotoUrl(null);
        setPhotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsUploading(false);
    };

    const handleEditStart = (memo: Memo) => {
        setEditingId(memo.id);
        setSelectedWeather(memo.weather);
        setContent(memo.content);
        setPhotoUrl(memo.photo || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setSelectedWeather('sunny');
        setContent('');
        setPhotoUrl(null);
        setPhotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDelete = (id: string) => {
        if (window.confirm('정말 이 기록을 삭제하시겠습니까?')) {
            setMemos(memos.filter(memo => memo.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#fcfbf9] dark:bg-gray-800 rounded-2xl border border-[#e5dfd3] dark:border-gray-700 p-5 shadow-sm transition-colors">
                <h2 className="text-xl font-bold text-[#4a5f41] dark:text-green-400 mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5" />
                    {editingId ? '작업 기록 수정하기' : '오늘 작업 기록하기'}
                </h2>

                {/* 날씨 선택 */}
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">오늘의 날씨</p>
                    <div className="flex gap-3">
                        {WEATHER_OPTIONS.map((w) => {
                            const Icon = w.icon;
                            const isSelected = selectedWeather === w.id;
                            return (
                                <button
                                    key={w.id}
                                    onClick={() => setSelectedWeather(w.id)}
                                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${isSelected
                                        ? 'bg-white border-[#8b9e83] shadow-md ring-2 ring-[#8b9e83]/20 dark:bg-gray-700 dark:border-green-500 dark:ring-green-500/20'
                                        : 'bg-white/50 border-gray-200 hover:bg-white dark:bg-gray-900 dark:border-gray-600 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon className={`w-6 h-6 ${w.color}`} />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{w.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 태그 (빠른 입력) */}
                <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">주요 작업 빠른 입력</p>
                    <div className="flex flex-wrap gap-2">
                        {JOB_TAGS.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleAddTag(tag)}
                                className="px-4 py-2 bg-white dark:bg-gray-700 border border-[#e5dfd3] dark:border-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-[#f1ecd9] dark:hover:bg-gray-600 transition-colors shadow-sm"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 텍스트 입력창 */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="오늘은 어떤 작업을 하셨나요?"
                    className="w-full h-36 p-4 rounded-xl border border-[#d6cfbe] dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8b9e83] focus:border-transparent resize-none mb-4 text-lg shadow-inner block"
                />

                {/* 사진 첨부 영역 */}
                <div className="mb-4">
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handlePhotoChange}
                    />

                    {photoUrl ? (
                        <div className="relative inline-block w-full bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <img
                                src={photoUrl}
                                alt="첨부된 사진 미리보기"
                                className="w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                            />
                            <button
                                onClick={handleRemovePhoto}
                                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-sm shadow-md"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white dark:bg-gray-700 border-2 border-dashed border-[#d6cfbe] dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-[#fcfaf5] dark:hover:bg-gray-600 transition-colors shadow-sm font-medium"
                        >
                            <Camera className="w-6 h-6 text-[#6c8561] dark:text-green-400" />
                            영농 사진 첨부하기
                        </button>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!content.trim() || isUploading}
                        className="flex-[3] py-4 bg-[#6c8561] hover:bg-[#5b7250] disabled:bg-[#d6cfbe] dark:disabled:bg-gray-700 text-white font-bold rounded-xl transition-all shadow-md text-lg disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block" />
                                처리 중...
                            </>
                        ) : (
                            editingId ? '기록 수정하기' : '기록 저장하기'
                        )}
                    </button>
                    {editingId && (
                        <button
                            onClick={handleCancelEdit}
                            className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-all shadow-md text-lg"
                        >
                            취소
                        </button>
                    )}
                </div>
            </div>

            {/* 리스트 뷰 */}
            {memos.length > 0 && (
                <div className="space-y-4 animate-fadeInUp">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-8 mb-4">
                        📚 나의 영농 일지
                    </h3>
                    {memos.map((memo) => {
                        const weatherConfig = WEATHER_OPTIONS.find((w) => w.id === memo.weather) || WEATHER_OPTIONS[0];
                        const WeatherIcon = weatherConfig.icon;

                        return (
                            <div
                                key={memo.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition-colors"
                            >
                                <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {memo.date}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-700">
                                            <WeatherIcon className={`w-4 h-4 ${weatherConfig.color}`} />
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{weatherConfig.label}</span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                            <button
                                                onClick={() => handleEditStart(memo)}
                                                className="p-1.5 text-gray-400 hover:text-[#6c8561] hover:bg-[#6c8561]/10 rounded-lg transition-colors"
                                                title="수정"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(memo.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors dark:hover:bg-red-900/20"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap text-lg leading-relaxed">
                                        {memo.content}
                                    </p>
                                    {memo.photo && (
                                        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-800 flex justify-center">
                                            <img
                                                src={memo.photo}
                                                alt="영농 일지 첨부 사진"
                                                className="max-w-full max-h-[400px] object-contain hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
