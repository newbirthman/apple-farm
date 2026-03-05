'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SeasonCard from '@/components/SeasonCard';
import WorkflowTimeline from '@/components/WorkflowTimeline';
import MemoForm from '@/components/MemoForm';
import InventoryManager from '@/components/inventory/InventoryManager';
import { seasons, getCurrentSeason, getSeasonData } from '@/data/farmWorkflow';
import type { SeasonId } from '@/data/farmWorkflow';
import { Sprout, Map, BookOpen, Box, ChevronDown } from 'lucide-react';

export default function Home() {
  const [currentSeason, setCurrentSeason] = useState<SeasonId>('spring');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'diary' | 'inventory'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: '지금 할 일', icon: Sprout },
    { id: 'timeline', label: '연간 워크플로우', icon: Map },
    { id: 'diary', label: '영농 일지', icon: BookOpen },
    { id: 'inventory', label: '재고/판매 관리', icon: Box },
  ] as const;

  const ActiveIcon = tabs.find(t => t.id === activeTab)?.icon || Sprout;
  const activeLabel = tabs.find(t => t.id === activeTab)?.label || '지금 할 일';

  useEffect(() => {
    setCurrentSeason(getCurrentSeason());
  }, []);

  const seasonData = getSeasonData(currentSeason);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header currentSeason={currentSeason} />

      {/* 탭 네비게이션 (모바일/공용 드롭다운 확장 메뉴) */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-full flex items-center justify-between px-2 py-4 text-base font-semibold text-gray-900 dark:text-gray-100 min-h-[56px] focus:outline-none"
          >
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <ActiveIcon className="w-5 h-5" />
              <span>{activeLabel}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* 확장 메뉴 리스트 */}
          {isMenuOpen && (
            <>
              {/* 바깥 배경 클릭 시 모달 닫기 처리용 오버레이 */}
              <div 
                className="fixed inset-0 top-[calc(56px+env(safe-area-inset-top))] z-30" 
                onClick={() => setIsMenuOpen(false)}
              ></div>
              <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xl flex flex-col z-40 animate-fadeInUp origin-top rounded-b-xl overflow-hidden pb-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as typeof activeTab);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-6 py-4 text-base font-medium transition-colors text-left ${isActive
                        ? 'bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-l-4 border-green-600'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {activeTab === 'dashboard' ? (
          <div>
            {/* 시즌 안내 배너 */}
            <div className={`${seasonData.bgColor} dark:bg-opacity-20 ${seasonData.borderColor} border-2 rounded-2xl p-5 mb-6`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{seasonData.emoji}</span>
                <div>
                  <h2 className={`text-xl font-bold ${seasonData.textColor}`}>
                    {seasonData.name} 시즌 작업 가이드
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
                    지금 시기에 집중해야 할 핵심 작업 {seasonData.tasks.length}가지
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {seasonData.tasks.map((task, index) => (
                <SeasonCard
                  key={task.id}
                  task={task}
                  seasonColor={seasonData.color}
                  index={index}
                />
              ))}
            </div>

            {/* 다음 시즌 미리보기 */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
                📋 다음 시즌 미리보기
              </h3>
              {(() => {
                const seasonOrder: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];
                const nextIdx = (seasonOrder.indexOf(currentSeason) + 1) % 4;
                const nextSeason = getSeasonData(seasonOrder[nextIdx]);
                return (
                  <div className={`${nextSeason.bgColor} dark:bg-opacity-20 rounded-xl p-4`}>
                    <p className={`font-semibold ${nextSeason.textColor} text-base mb-2`}>
                      {nextSeason.emoji} {nextSeason.name} ({nextSeason.months.map(m => `${m}월`).join(' · ')})
                    </p>
                    <ul className="space-y-1.5">
                      {nextSeason.tasks.map(task => (
                        <li key={task.id} className="text-gray-700 dark:text-gray-300 text-[15px] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0" />
                          {task.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : activeTab === 'timeline' ? (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                🗓️ 사과 재배 연간 워크플로우
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                4계절 전체 일정을 확인하고, 각 작업을 클릭하면 상세 정보를 볼 수 있습니다.
              </p>
            </div>

            <WorkflowTimeline seasons={seasons} currentSeason={currentSeason} />
          </div>
        ) : activeTab === 'diary' ? (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mb-6 animate-fadeInUp">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                🖋️ 하루 작업 기록
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                오늘 농장에서 진행한 주요 작업을 간편하게 기록하고 관리해 보세요.
              </p>
            </div>

            <MemoForm />
          </div>
        ) : (
          <InventoryManager />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 text-center py-3 text-sm text-gray-500 dark:text-gray-400 z-20">
        🍎 스마트 사과 영농일지 · 성공적인 사과 재배의 시작
      </footer>
    </div>
  );
}
