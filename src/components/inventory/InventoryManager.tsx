import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import DailyDashboard from './DailyDashboard';
import IncomingForm from './IncomingForm';
import SalesForm from './SalesForm';
import PriceListView from './PriceListView';
import { Tabs } from '@/components/ui';

export default function InventoryManager() {
    // 전역(최상단의 이 영역 기준) 상태 훅으로 각 폼들에 상태 공유
    const inventoryHook = useInventory();
    const [activeTab, setActiveTab] = useState<string>('dashboard');

    if (inventoryHook.isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fadeInUp">
                <span className="animate-spin w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">데이터베이스에서 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm mb-6 animate-fadeInUp">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    📦 사과 농장 재고 및 판매 관리
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    품목별 생산량을 기록하고, 일자별 매출과 실시간 누적 재고 자산을 한눈에 파악하세요.
                </p>
            </div>

            <Tabs
                tabs={[
                    { id: 'dashboard', label: '📊 일일 대시보드' },
                    { id: 'incoming', label: '📥 입고 등록' },
                    { id: 'sales', label: '💸 판매 등록' },
                    { id: 'prices', label: '💰 단가표(Price List)' }
                ]}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            <div className="mt-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                {activeTab === 'dashboard' && <DailyDashboard inventoryHook={inventoryHook} />}
                {activeTab === 'incoming' && (
                    <IncomingForm
                        inventoryHook={inventoryHook}
                        onSuccess={() => setActiveTab('dashboard')}
                    />
                )}
                {activeTab === 'sales' && (
                    <SalesForm
                        inventoryHook={inventoryHook}
                        onSuccess={() => setActiveTab('dashboard')}
                    />
                )}
                {activeTab === 'prices' && (
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
            </div>
        </div>
    );
}
