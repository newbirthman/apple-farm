'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import SeasonCard from '@/components/SeasonCard';
import WorkflowTimeline from '@/components/WorkflowTimeline';
import MemoForm from '@/components/MemoForm';
import DailyDashboard from '@/components/inventory/DailyDashboard';
import IncomingForm from '@/components/inventory/IncomingForm';
import SalesForm from '@/components/inventory/SalesForm';
import PriceListView from '@/components/inventory/PriceListView';
import ProductManager from '@/components/inventory/ProductManager';
import CustomerManager from '@/components/inventory/CustomerManager';
import { useInventory } from '@/hooks/useInventory';
import { seasons, getCurrentSeason, getSeasonData } from '@/data/farmWorkflow';
import type { SeasonId } from '@/data/farmWorkflow';
import { Home, BookOpen, Package, DollarSign, Tag, Users } from 'lucide-react';
import { Tabs } from '@/components/ui';

export default function MainPage() {
  const [currentSeason, setCurrentSeason] = useState<SeasonId>('spring');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [inventorySubTab, setInventorySubTab] = useState<string>('dashboard');
  const [productsSubTab, setProductsSubTab] = useState<string>('product');
  const inventoryHook = useInventory();

  useEffect(() => {
    setCurrentSeason(getCurrentSeason());
  }, []);

  const seasonData = getSeasonData(currentSeason);

  // 메인 탭 정의 (모바일 앱과 동일)
  const mainTabs = [
    { id: 'home', label: '🏠 홈', icon: Home },
    { id: 'diary', label: '📖 영농일지', icon: BookOpen },
    { id: 'inventory', label: '📦 재고관리', icon: Package },
    { id: 'sales', label: '💵 판매관리', icon: DollarSign },
    { id: 'products', label: '🏷️ 상품관리', icon: Tag },
    { id: 'customers', label: '👥 고객관리', icon: Users },
  ];

  const urgencyBadge: Record<string, { bg: string; text: string; label: string }> = {
    '높음': { bg: '#fee2e2', text: '#dc2626', label: '🔴 긴급' },
    '보통': { bg: '#fef9c3', text: '#ca8a04', label: '🟡 보통' },
    '낮음': { bg: '#dcfce7', text: '#16a34a', label: '🟢 여유' },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
      <Header currentSeason={currentSeason} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* ═══════ 홈 화면 ═══════ */}
        {activeTab === 'home' && (
          <div className="animate-fadeInUp">
            {/* 환영 인사 */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">안녕하세요 사장님! 👋</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">오늘도 보람찬 하루 되세요.</p>
            </div>

            {/* 시즌 가이드 배너 */}
            <div className={`${seasonData.bgColor} dark:bg-opacity-20 ${seasonData.borderColor} border-2 rounded-2xl p-5 mb-6`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{seasonData.emoji}</span>
                <div>
                  <h2 className={`text-xl font-bold ${seasonData.textColor}`}>
                    {seasonData.name} 시즌 작업 가이드
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">
                    지금 시기에 집중해야 할 핵심 작업 {seasonData.tasks.length}가지
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
                {seasonData.tasks.map((task) => {
                  const urgency = urgencyBadge[task.urgency];
                  return (
                    <div key={task.id} className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{task.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold`} style={{ backgroundColor: urgency.bg, color: urgency.text }}>{urgency.label}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">📅 {task.period}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 다음 시즌 미리보기 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">📋 다음 시즌 미리보기</h3>
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
        )}

        {/* ═══════ 영농일지 ═══════ */}
        {activeTab === 'diary' && (
          <div className="animate-fadeInUp">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">🖋️ 하루 작업 기록</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">오늘 농장에서 진행한 주요 작업을 간편하게 기록하고 관리해 보세요.</p>
            </div>
            <MemoForm />
          </div>
        )}

        {/* ═══════ 재고관리 (대시보드 + 입고등록 서브탭) ═══════ */}
        {activeTab === 'inventory' && (
          <div className="animate-fadeInUp">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">📦 재고 관리</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">품목별 재고 현황과 입고를 관리합니다.</p>
            </div>
            <Tabs
              tabs={[
                { id: 'dashboard', label: '📊 대시보드' },
                { id: 'incoming', label: '📥 입고 등록' },
              ]}
              activeTab={inventorySubTab}
              onChange={setInventorySubTab}
            />
            <div className="mt-4">
              {inventoryHook.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <span className="animate-spin w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">데이터 로딩 중...</p>
                </div>
              ) : (
                <>
                  {inventorySubTab === 'dashboard' && <DailyDashboard inventoryHook={inventoryHook} />}
                  {inventorySubTab === 'incoming' && <IncomingForm inventoryHook={inventoryHook} onSuccess={() => setInventorySubTab('dashboard')} />}
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══════ 판매관리 ═══════ */}
        {activeTab === 'sales' && (
          <div className="animate-fadeInUp">
            {inventoryHook.isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="animate-spin w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">데이터 로딩 중...</p>
              </div>
            ) : (
              <SalesForm inventoryHook={inventoryHook} onSuccess={() => setActiveTab('inventory')} />
            )}
          </div>
        )}

        {/* ═══════ 상품관리 (상품등록 + 단가표 서브탭) ═══════ */}
        {activeTab === 'products' && (
          <div className="animate-fadeInUp">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">🏷️ 상품 관리</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">상품 등록 및 단가를 관리합니다.</p>
            </div>
            <Tabs
              tabs={[
                { id: 'product', label: '📝 상품 등록' },
                { id: 'prices', label: '💰 단가표' },
              ]}
              activeTab={productsSubTab}
              onChange={setProductsSubTab}
            />
            <div className="mt-4">
              {inventoryHook.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <span className="animate-spin w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">데이터 로딩 중...</p>
                </div>
              ) : (
                <>
                  {productsSubTab === 'product' && <ProductManager inventoryHook={inventoryHook} />}
                  {productsSubTab === 'prices' && (
                    <PriceListView
                      prices={inventoryHook.prices}
                      deliveryFee={inventoryHook.deliveryFee}
                      deliveryFeeIsland={inventoryHook.deliveryFeeIsland}
                      updateDeliveryFee={inventoryHook.updateDeliveryFee}
                      updateDeliveryFeeIsland={inventoryHook.updateDeliveryFeeIsland}
                      updatePrice={inventoryHook.updatePrice}
                      deletePriceItem={inventoryHook.deletePriceItem}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══════ 고객관리 ═══════ */}
        {activeTab === 'customers' && (
          <div className="animate-fadeInUp">
            <CustomerManager />
          </div>
        )}
      </main>

      {/* ═══════ 하단 고정 탭바 (모바일 앱과 동일) ═══════ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-4xl mx-auto flex">
          {mainTabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${isActive
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-green-600 dark:text-green-400' : ''}`} />
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                  {tab.label.replace(/^[^\s]+\s/, '')}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
