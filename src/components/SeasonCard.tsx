'use client';

import { useState } from 'react';
import {
    Scissors, Leaf, ShieldCheck, Bug, Flower2, Thermometer,
    TreeDeciduous, Shield, Droplets, Palette, Apple, Warehouse,
    ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Lightbulb
} from 'lucide-react';
import type { FarmTask } from '@/data/farmWorkflow';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Scissors, Leaf, ShieldCheck, Bug, Flower2, Thermometer,
    TreeDeciduous, Shield, Droplets, Palette, Apple, Warehouse,
};

const urgencyStyles: Record<string, { bg: string; text: string; label: string }> = {
    '높음': { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', label: '🔴 긴급' },
    '보통': { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', label: '🟡 보통' },
    '낮음': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', label: '🟢 여유' },
};

interface SeasonCardProps {
    task: FarmTask;
    seasonColor: string;
    index: number;
}

export default function SeasonCard({ task, seasonColor, index }: SeasonCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const IconComponent = iconMap[task.icon] || Leaf;
    const urgency = urgencyStyles[task.urgency];

    const colorVariants: Record<string, {
        card: string; iconBg: string; iconText: string; btn: string;
    }> = {
        blue: { card: 'border-blue-300 dark:border-blue-700 hover:shadow-blue-100', iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconText: 'text-blue-600 dark:text-blue-400', btn: 'bg-blue-600 hover:bg-blue-700' },
        pink: { card: 'border-pink-300 dark:border-pink-700 hover:shadow-pink-100', iconBg: 'bg-pink-100 dark:bg-pink-900/50', iconText: 'text-pink-600 dark:text-pink-400', btn: 'bg-pink-600 hover:bg-pink-700' },
        green: { card: 'border-green-300 dark:border-green-700 hover:shadow-green-100', iconBg: 'bg-green-100 dark:bg-green-900/50', iconText: 'text-green-600 dark:text-green-400', btn: 'bg-green-600 hover:bg-green-700' },
        red: { card: 'border-red-300 dark:border-red-700 hover:shadow-red-100', iconBg: 'bg-red-100 dark:bg-red-900/50', iconText: 'text-red-600 dark:text-red-400', btn: 'bg-red-600 hover:bg-red-700' },
    };

    const colors = colorVariants[seasonColor] || colorVariants.green;

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-2xl border-2 ${colors.card} shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fadeInUp`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className={`${colors.iconBg} rounded-xl p-3 shrink-0`}>
                        <IconComponent className={`w-7 h-7 ${colors.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                {task.title}
                            </h3>
                            <span className={`${urgency.bg} ${urgency.text} text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap`}>
                                {urgency.label}
                            </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">📅 {task.period}</p>
                    </div>
                </div>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`mt-4 w-full flex items-center justify-center gap-2 ${colors.btn} text-white font-semibold py-3 px-4 rounded-xl text-base transition-colors min-h-[48px] active:scale-[0.98]`}
                >
                    {isOpen ? '접기' : '자세히 보기'}
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
            </div>

            {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 animate-slideDown">
                    <div className="mb-4">
                        <h4 className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-gray-200 mb-3">
                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                            효과적인 방법
                        </h4>
                        <ul className="space-y-2">
                            {task.methods.map((method, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>{method}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-gray-200 mb-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            주의점
                        </h4>
                        <ul className="space-y-2">
                            {task.cautions.map((caution, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
                                    <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-1" />
                                    <span>{caution}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
