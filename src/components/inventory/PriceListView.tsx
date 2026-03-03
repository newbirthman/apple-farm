import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import type { PriceItem, Category } from '@/types/inventory';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableHead, TableCell, Input } from '@/components/ui';

interface PriceListViewProps {
    prices: PriceItem[];
    updatePrice: (id: string, newPrice: number) => void;
}

export default function PriceListView({ prices, updatePrice }: PriceListViewProps) {
    const categories: Category[] = ['10kg', '5kg', '사과즙'];
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<string>('');

    const getItemsByCategory = (category: Category) => {
        return prices.filter(p => p.category === category);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">💰 기준 단가표 (Price List)</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    현재 설정된 기준 단가 리스트입니다. (합계 금액 및 판매 계산 시 자동 연동됩니다)
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map(category => {
                    const items = getItemsByCategory(category);
                    if (items.length === 0) return null;

                    return (
                        <Card key={category}>
                            <CardHeader className="bg-gray-50/50 dark:bg-gray-800/30">
                                <CardTitle className="flex items-center gap-2">
                                    {category === '10kg' || category === '5kg' ? '🍎' : '🧃'}
                                    {category} 카테고리
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">품목 이름</TableHead>
                                            <TableHead className="text-right w-[140px]">단가 (원)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <tbody>
                                        {items.map(item => {
                                            const isEditing = editingId === item.id;
                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                        {item.itemName}
                                                    </TableCell>
                                                    <TableCell className="text-right text-gray-600 dark:text-gray-300">
                                                        {isEditing ? (
                                                            <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                                                                <Input
                                                                    type="number"
                                                                    value={editPrice}
                                                                    onChange={e => setEditPrice(e.target.value)}
                                                                    step={5000}
                                                                    className="!w-20 h-8 px-2 py-1 text-right text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                                    onKeyDown={e => {
                                                                        if (e.key === 'ArrowUp') {
                                                                            e.preventDefault();
                                                                            setEditPrice(prev => String(Math.max(0, Number(prev) + 5000)));
                                                                        } else if (e.key === 'ArrowDown') {
                                                                            e.preventDefault();
                                                                            setEditPrice(prev => String(Math.max(0, Number(prev) - 5000)));
                                                                        }
                                                                    }}
                                                                />
                                                                <button onClick={() => {
                                                                    const num = parseInt(editPrice, 10);
                                                                    if (num >= 0) {
                                                                        updatePrice(item.id, num);
                                                                        setEditingId(null);
                                                                    }
                                                                }}
                                                                    title="저장"
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setEditingId(null)} title="취소" className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <span>{item.price.toLocaleString()} 원</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingId(item.id);
                                                                        setEditPrice(item.price.toString());
                                                                    }}
                                                                    title="단가 수정"
                                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
