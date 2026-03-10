import React, { useState } from 'react';
import { Edit2, Check, X, Trash2 } from 'lucide-react';
import type { PriceItem, Category } from '@/types/inventory';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableHead, TableCell, Input, Button } from '@/components/ui';

interface PriceListViewProps {
    prices: PriceItem[];
    deliveryFee: number;
    deliveryFeeIsland: number;
    updateDeliveryFee: (fee: number) => void;
    updateDeliveryFeeIsland: (fee: number) => void;
    updatePrice: (id: string, newPrice: number) => void;
    deletePriceItem: (id: string) => void;
}

export default function PriceListView({ prices, deliveryFee, deliveryFeeIsland, updateDeliveryFee, updateDeliveryFeeIsland, updatePrice, deletePriceItem }: PriceListViewProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<string>('');
    const [feeInput, setFeeInput] = useState<string>(String(deliveryFee || 0));
    const [feeIslandInput, setFeeIslandInput] = useState<string>(String(deliveryFeeIsland || 0));
    const [isEditingFee, setIsEditingFee] = useState(false);

    const cropTypes = Array.from(new Set(prices.map(p => p.cropType || '사과')));

    const getItemsByCategory = (crop: string, category: string) =>
        prices.filter(p => (p.cropType || '사과') === crop && p.category === category);

    const handleDelete = (item: PriceItem) => {
        if (confirm(`정말 [${item.itemName}] 항목을 삭제하시겠습니까?`)) {
            deletePriceItem(item.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* 택배비 설정 (일반 + 도서산간) */}
            <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10">
                <CardContent className="py-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base mb-3">🚚 택배비 기본 요금 설정</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">이 금액은 택배 칼럼의 모든 단가에 합산됩니다.</p>

                    {isEditingFee ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-20 shrink-0">일반지역</span>
                                <Input type="number" value={feeInput} onChange={e => setFeeInput(e.target.value)} className="w-28 text-right font-bold" autoFocus />
                                <span className="text-sm text-gray-500">원</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-20 shrink-0">도서산간</span>
                                <Input type="number" value={feeIslandInput} onChange={e => setFeeIslandInput(e.target.value)} className="w-28 text-right font-bold" />
                                <span className="text-sm text-gray-500">원</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="primary" className="px-4 py-1.5 text-sm"
                                    onClick={() => {
                                        const num1 = parseInt(feeInput, 10);
                                        const num2 = parseInt(feeIslandInput, 10);
                                        if (!isNaN(num1) && num1 >= 0) updateDeliveryFee(num1);
                                        if (!isNaN(num2) && num2 >= 0) updateDeliveryFeeIsland(num2);
                                        setIsEditingFee(false);
                                    }}>저장</Button>
                                <Button variant="secondary" className="px-4 py-1.5 text-sm"
                                    onClick={() => { setFeeInput(String(deliveryFee)); setFeeIslandInput(String(deliveryFeeIsland)); setIsEditingFee(false); }}>취소</Button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => { setFeeInput(String(deliveryFee)); setFeeIslandInput(String(deliveryFeeIsland)); setIsEditingFee(true); }}
                            className="flex flex-col gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-800/30 px-4 py-3 rounded-lg transition-colors w-full text-left"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">일반지역</span>
                                <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400">💵 {deliveryFee.toLocaleString()} 원</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">도서산간</span>
                                <span className="text-xl font-extrabold text-orange-600 dark:text-orange-400">🏝️ {deliveryFeeIsland.toLocaleString()} 원</span>
                            </div>
                            <span className="text-xs text-blue-600 font-bold text-right">탭하여 수정</span>
                        </button>
                    )}
                </CardContent>
            </Card>

            {/* 단가 테이블 */}
            <Card>
                <CardHeader className="bg-green-50/50 dark:bg-green-900/20 rounded-t-xl border-b border-green-100 dark:border-green-900/30">
                    <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                        💰 기준 단가표 (Price List)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {cropTypes.map(crop => {
                        const cropItems = prices.filter(p => (p.cropType || '사과') === crop);
                        const categories = Array.from(new Set(cropItems.map(p => p.category)));
                        return (
                            <div key={crop} className="mb-8">
                                <h3 className="text-lg font-black text-green-700 dark:text-green-400 mb-3">🌱 {crop}</h3>
                                {categories.map(category => {
                                    const items = getItemsByCategory(crop, category);
                                    if (items.length === 0) return null;
                                    return (
                                        <div key={category} className="mb-4">
                                            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-t-lg border border-b-0 border-gray-200 dark:border-gray-700">
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">📦 {category} 기준</span>
                                            </div>
                                            <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-b-lg">
                                                <table className="w-full text-sm text-left" style={{ minWidth: '420px' }}>
                                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                                        <tr>
                                                            <th className="px-3 py-3 font-medium whitespace-nowrap w-[80px]">분류</th>
                                                            <th className="px-3 py-3 font-medium whitespace-nowrap text-right w-[120px]">도/소매</th>
                                                            <th className="px-3 py-3 font-medium whitespace-nowrap text-right text-blue-600 dark:text-blue-400 w-[120px]">택배</th>
                                                            <th className="px-3 py-3 font-medium whitespace-nowrap text-right w-[60px]">관리</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {items.map(item => {
                                                            const isEditing = editingId === item.id;
                                                            const deliveryPrice = item.price + deliveryFee;
                                                            return (
                                                                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                                                    <td className="px-3 py-3 font-medium whitespace-nowrap">{item.itemName || '기본'}</td>
                                                                    <td className="px-3 py-3 text-right whitespace-nowrap">
                                                                        {isEditing ? (
                                                                            <div className="flex items-center justify-end gap-1">
                                                                                <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="w-24 text-right text-sm py-1" autoFocus />
                                                                                <button onClick={() => { const num = parseInt(editPrice, 10); if (num >= 0) { updatePrice(item.id, num); setEditingId(null); } }}
                                                                                    className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"><Check className="w-4 h-4 text-green-600" /></button>
                                                                                <button onClick={() => setEditingId(null)}
                                                                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"><X className="w-4 h-4 text-red-500" /></button>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-gray-700 dark:text-gray-300">{item.price.toLocaleString()}</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-3 text-right text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
                                                                        {deliveryPrice.toLocaleString()}
                                                                    </td>
                                                                    <td className="px-3 py-3 text-right">
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <button onClick={() => { setEditingId(item.id); setEditPrice(String(item.price)); }}
                                                                                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600" title="수정"><Edit2 className="w-3.5 h-3.5" /></button>
                                                                            <button onClick={() => handleDelete(item)}
                                                                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500" title="삭제"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
