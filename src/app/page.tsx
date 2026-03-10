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
import WeatherWidget from '@/components/WeatherWidget';
import { useInventory } from '@/hooks/useInventory';
import { seasons, getCurrentSeason, getSeasonData } from '@/data/farmWorkflow';
import type { SeasonId } from '@/data/farmWorkflow';
import { Home, BookOpen, Package, DollarSign, Tag, Users } from 'lucide-react';
import { Tabs } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function MainPage() {
  const [currentSeason, setCurrentSeason] = useState<SeasonId>('spring');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [inventorySubTab, setInventorySubTab] = useState<string>('dashboard');
  const [productsSubTab, setProductsSubTab] = useState<string>('product');
  const [recentMemos, setRecentMemos] = useState<any[]>([]);
  const [todoCount, setTodoCount] = useState<number | string>("...");
  const inventoryHook = useInventory();

  useEffect(() => {
    setCurrentSeason(getCurrentSeason());
  }, []);

  // 홈 대시보드용 데이터 페칭
  useEffect(() => {
    if (activeTab === 'home') {
      (async () => {
        try {
          // 1. 최근 영농일지 2건
          const { data: memos } = await supabase
            .from('memos')
            .select('*')
            .order('date', { ascending: false })
            .limit(2);
          if (memos) setRecentMemos(memos);

          // 2. 미완료 할일
          const { count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('done', false);
          setTodoCount(count || 0);
        } catch (err) {
          console.error("대시보드 데이터 로드 실패:", err);
        }
      })();
    }
  }, [activeTab]);

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
          <div className="animate-fadeInUp space-y-6">
            {/* 날씨/미세먼지 위젯 (웹 전용) */}
            <WeatherWidget />

            {/* 환영 인사 */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">사장님, 반갑습니다! 👋</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">오늘 농장의 주요 현황을 확인하세요.</p>
            </div>

            {/* 대시보드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* 오늘의 판매 */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">💸 오늘의 판매</p>
                <p className="text-2xl font-black text-green-600 dark:text-green-400">
                  {(() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    return inventoryHook.sales
                      .filter(s => s.date === todayStr)
                      .reduce((sum, s) => sum + (s.totalPrice || 0), 0)
                      .toLocaleString();
                  })()}원
                </p>
              </div>

              {/* 할 일 현황 */}
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">✅ 미완료 할일</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-red-500">
                    {todoCount}건
                  </p>
                  <button onClick={() => setActiveTab('diary')} className="text-xs text-blue-500 hover:underline">일지에서 확인</button>
                </div>
              </div>
            </div>

            {/* 최근 영농일지 요약 (통합 카드) */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <span>🖋️</span> 최근 영농일지
              </h3>
              <div className="space-y-4">
                {recentMemos.length > 0 ? recentMemos.map((memo) => (
                  <div key={memo.id} className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                    <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">{memo.date}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed">
                      {memo.content}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 italic">기록된 일지가 없습니다.</p>
                )}
              </div>
            </div>

            {/* 재고 부족 알림 */}
            {(() => {
              const summaryMap: Record<string, number> = {};
              inventoryHook.incoming.filter(i => i.type === '판매대기').forEach(r => {
                const key = `${r.cropType || '사과'} ${r.category} ${r.itemName || ''}`;
                summaryMap[key] = (summaryMap[key] || 0) + r.quantity;
              });
              inventoryHook.sales.forEach(s => {
                const key = `${s.cropType || '사과'} ${s.category} ${s.itemName || ''}`;
                if (summaryMap[key]) summaryMap[key] -= s.quantity;
              });
              const lowStock = Object.entries(summaryMap)
                .filter(([_, qty]) => qty > 0 && qty < 10);

              if (lowStock.length === 0) return null;

              return (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border-l-4 border-amber-500 shadow-sm">
                  <h3 className="text-lg font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                    <span>⚠️</span> 재고 부족 주의
                  </h3>
                  <div className="space-y-2">
                    {lowStock.map(([name, qty], idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{name}</span>
                        <span className="font-bold text-red-600">{qty}개 남음</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
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
