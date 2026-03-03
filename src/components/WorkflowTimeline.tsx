'use client';

import { useState } from 'react';
import {
    Scissors, Leaf, ShieldCheck, Bug, Flower2, Thermometer,
    TreeDeciduous, Shield, Droplets, Palette, Apple, Warehouse,
    ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Lightbulb
} from 'lucide-react';
import type { SeasonData, SeasonId } from '@/data/farmWorkflow';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Scissors, Leaf, ShieldCheck, Bug, Flower2, Thermometer,
    TreeDeciduous, Shield, Droplets, Palette, Apple, Warehouse,
};

interface WorkflowTimelineProps {
    seasons: SeasonData[];
    currentSeason: SeasonId;
}

export default function WorkflowTimeline({ seasons, currentSeason }: WorkflowTimelineProps) {
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

    const toggleTask = (taskId: string) => {
        setExpandedTasks(prev => {
            const next = new Set(prev);
            if (next.has(taskId)) {
                next.delete(taskId);
            } else {
                next.add(taskId);
            }
            return next;
        });
    };

    const seasonStyles: Record<SeasonId, {
        dotBg: string; lineBg: string; activeBorder: string;
        activeBg: string; badge: string; iconBg: string; iconText: string;
    }> = {
        winter: {
            dotBg: 'bg-blue-500', lineBg: 'bg-blue-200 dark:bg-blue-800', activeBorder: 'border-blue-400 dark:border-blue-600',
            activeBg: 'bg-blue-50 dark:bg-blue-950/50', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconText: 'text-blue-600 dark:text-blue-400',
        },
        spring: {
            dotBg: 'bg-pink-500', lineBg: 'bg-pink-200 dark:bg-pink-800', activeBorder: 'border-pink-400 dark:border-pink-600',
            activeBg: 'bg-pink-50 dark:bg-pink-950/50', badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
            iconBg: 'bg-pink-100 dark:bg-pink-900/50', iconText: 'text-pink-600 dark:text-pink-400',
        },
        summer: {
            dotBg: 'bg-green-500', lineBg: 'bg-green-200 dark:bg-green-800', activeBorder: 'border-green-400 dark:border-green-600',
            activeBg: 'bg-green-50 dark:bg-green-950/50', badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            iconBg: 'bg-green-100 dark:bg-green-900/50', iconText: 'text-green-600 dark:text-green-400',
        },
        autumn: {
            dotBg: 'bg-red-500', lineBg: 'bg-red-200 dark:bg-red-800', activeBorder: 'border-red-400 dark:border-red-600',
            activeBg: 'bg-red-50 dark:bg-red-950/50', badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
            iconBg: 'bg-red-100 dark:bg-red-900/50', iconText: 'text-red-600 dark:text-red-400',
        },
    };

    return (
        <div className="relative">
            {seasons.map((season, sIdx) => {
                const isCurrent = season.id === currentSeason;
                const styles = seasonStyles[season.id];

                return (
                    <div key={season.id} className="relative">
                        {sIdx < seasons.length - 1 && (
                            <div className={`absolute left-[23px] top-[56px] bottom-0 w-0.5 ${styles.lineBg}`} />
                        )}

                        <div className="flex items-center gap-4 mb-4">
                            <div className={`relative z-10 w-12 h-12 rounded-full ${styles.dotBg} flex items-center justify-center text-white text-2xl shadow-md shrink-0 ${isCurrent ? 'ring-4 ring-offset-2 ring-green-400 dark:ring-offset-gray-900 animate-pulse-slow' : ''}`}>
                                {season.emoji}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {season.name}
                                </h3>
                                <span className={`text-sm font-medium px-3 py-1 rounded-full ${styles.badge}`}>
                                    {season.months.map(m => `${m}월`).join(' · ')}
                                </span>
                                {isCurrent && (
                                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce-gentle">
                                        📌 현재 시즌
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="ml-6 pl-6 border-l-2 border-transparent mb-8">
                            <div className="space-y-3">
                                {season.tasks.map((task) => {
                                    const isExpanded = expandedTasks.has(task.id);
                                    const IconComponent = iconMap[task.icon] || Leaf;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${isCurrent
                                                    ? `${styles.activeBg} ${styles.activeBorder} shadow-md`
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75 hover:opacity-100'
                                                }`}
                                        >
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className="w-full text-left p-4 flex items-center gap-3 min-h-[56px] active:bg-gray-50 dark:active:bg-gray-700"
                                            >
                                                <div className={`${styles.iconBg} rounded-lg p-2 shrink-0`}>
                                                    <IconComponent className={`w-5 h-5 ${styles.iconText}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-[17px]">{task.title}</p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{task.period}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {task.urgency === '높음' && (
                                                        <span className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">긴급</span>
                                                    )}
                                                    {isExpanded
                                                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                                                        : <ChevronDown className="w-5 h-5 text-gray-400" />
                                                    }
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 animate-slideDown">
                                                    <div className="mb-4">
                                                        <h4 className="flex items-center gap-2 text-[15px] font-bold text-gray-800 dark:text-gray-200 mb-2">
                                                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                                                            효과적인 방법
                                                        </h4>
                                                        <ul className="space-y-1.5 ml-1">
                                                            {task.methods.map((method, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
                                                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                                    <span>{method}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="flex items-center gap-2 text-[15px] font-bold text-gray-800 dark:text-gray-200 mb-2">
                                                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                            주의점
                                                        </h4>
                                                        <ul className="space-y-1.5 ml-1">
                                                            {task.cautions.map((caution, idx) => (
                                                                <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed">
                                                                    <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                                                    <span>{caution}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
