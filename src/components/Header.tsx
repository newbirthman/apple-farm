'use client';

import { Calendar, Apple, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const seasonNames: Record<string, string> = {
    spring: '봄',
    summer: '여름',
    autumn: '가을',
    winter: '겨울',
};

const seasonEmojis: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    autumn: '🍎',
    winter: '❄️',
};

export default function Header({ currentSeason }: { currentSeason: string }) {
    const { theme, toggleTheme } = useTheme();
    const today = new Date();
    const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayStr = dayNames[today.getDay()];

    return (
        <header className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white shadow-lg">
            <div className="max-w-4xl mx-auto px-4 py-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
                            <Apple className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                                스마트 영농일지
                            </h1>
                            <p className="hidden sm:block text-green-100 dark:text-gray-400 text-sm mt-0.5">
                                시기별 작업을 한눈에 관리하세요
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        {/* 다크모드 토글 */}
                        <button
                            onClick={toggleTheme}
                            className="bg-white/20 hover:bg-white/30 dark:bg-gray-700 dark:hover:bg-gray-600 backdrop-blur-sm rounded-xl p-2.5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
                            aria-label="테마 전환"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <div className="text-right sm:text-right flex flex-col items-end">
                            <div className="flex items-center gap-1.5 text-green-100 dark:text-gray-400 text-sm font-medium">
                                <Calendar className="w-4 h-4" />
                                <span>{dateStr} ({dayStr})</span>
                            </div>
                            <div className="mt-1 bg-white/20 dark:bg-gray-700 backdrop-blur-sm rounded-full px-3 py-1 text-[13px] sm:text-sm font-semibold inline-flex items-center gap-1">
                                <span>{seasonEmojis[currentSeason]}</span>
                                <span>지금은 {seasonNames[currentSeason]} 시즌</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
