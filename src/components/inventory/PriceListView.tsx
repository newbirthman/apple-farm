import React, { useState } from 'react';
import { Edit2, Check, X, Trash2 } from 'lucide-react';
import type { PriceItem, Category } from '@/types/inventory';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableHead, TableCell, Input, Button } from '@/components/ui';

interface PriceListViewProps {
    prices: PriceItem[];
    deliveryFee: number;
    updateDeliveryFee: (fee: number) => void;
    updatePrice: (id: string, newPrice: number) => void;
    deletePriceItem: (id: string) => void;
}

export default function PriceListView({ prices, deliveryFee, updateDeliveryFee, updatePrice, deletePriceItem }: PriceListViewProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<string>('');
    const [feeInput, setFeeInput] = useState<string>(String(deliveryFee || 0));
    const [isEditingFee, setIsEditingFee] = useState(false);

    // 품목(cropType) 목록 추출
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
            {/* 글로벌 택배비 설정 (테이블 외부) */}
            <Card className="border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">🚚 택배비 기본 요금 설정</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">이 금액은 택배 칼럼의 모든 단가에 합산됩니다.</p>
                        </div>
                        {isEditingFee ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={feeInput}
                                    onChange={e => setFeeInput(e.target.value)}
                                    className="w-28 text-right font-bold"
                                    autoFocus
                                />
                                <span className="text-sm text-gray-500">원</span>
                                <Button variant="primary" className="px-3 py-1.5 text-sm"
                                    onClick={() => {
                                        const num = parseInt(feeInput, 10);
                                        if (!isNaN(num) && num >= 0) {
                                            updateDeliveryFee(num);
                                            setIsEditingFee(false);
                                        }
                                    }}>저장</Button>
                                <Button variant="secondary" className="px-3 py-1.5 text-sm"
                                    onClick={() => { setFeeInput(String(deliveryFee)); setIsEditingFee(false); }}>취소</Button>
                            </div>
                        ) : (
                            <button
                                onClick={() => { setFeeInput(String(deliveryFee)); setIsEditingFee(true); }}
                                className="flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 px-4 py-2 rounded-lg transition-colors"
                            >
                                <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">💵 {deliveryFee.toLocaleString()} 원</span>
                                <span className="text-xs text-blue-600 font-bold">수정</span>
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 단가 헤더 */}
            <Card>
                <CardHeader className="bg-green-50/50 dark:bg-green-900/20 rounded-t-xl border-b border-green-100 dark:border-green-900/30">
                    <CardTitle className="text-green-800 dark:text-green-400 flex items-center gap-2">
                        💰 기준 단가표 (Price List)
                    </CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">현재 설정된 기준 단가 리스트입니다. 합계 금액 및 판매 계산 시 자동 연동됩니다.</p>
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
                                            <Table className="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>분류</TableHead>
                                                        <TableHead className="text-right">도/소매</TableHead>
                                                        <TableHead className="text-right text-blue-600 dark:text-blue-400">택배</TableHead>
                                                        <TableHead className="text-right w-24">관리</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <tbody>
                                                    {items.map(item => {
                                                        const isEditing = editingId === item.id;
                                                        const deliveryPrice = item.price + deliveryFee;

                                                        return (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="font-medium">{item.itemName || '기본'}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {isEditing ? (
                                                                        <div className="flex items-center justify-end gap-1">
                                                                            <Input
                                                                                type="number"
                                                                                value={editPrice}
                                                                                onChange={e => setEditPrice(e.target.value)}
                                                                                className="w-20 text-right text-sm py-1"
                                                                                autoFocus
                                                                            />
                                                                            <button onClick={() => {
                                                                                const num = parseInt(editPrice, 10);
                                                                                if (num >= 0) { updatePrice(item.id, num); setEditingId(null); }
                                                                            }}
                                                                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                                                                            ><Check className="w-4 h-4 text-green-600" /></button>
                                                                            <button onClick={() => setEditingId(null)}
                                                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                                                            ><X className="w-4 h-4 text-red-500" /></button>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-700 dark:text-gray-300">{item.price.toLocaleString()}</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right text-blue-600 dark:text-blue-400 font-bold">
                                                                    {deliveryPrice.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={() => { setEditingId(item.id); setEditPrice(String(item.price)); }}
                                                                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600"
                                                                            title="수정"
                                                                        ><Edit2 className="w-3.5 h-3.5" /></button>
                                                                        <button
                                                                            onClick={() => handleDelete(item)}
                                                                            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                                                            title="삭제"
                                                                        ><Trash2 className="w-3.5 h-3.5" /></button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </tbody>
                                            </Table>
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
