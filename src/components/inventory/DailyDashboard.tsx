import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableHead, TableCell, Input } from '@/components/ui';
import type { InventorySummary } from '@/types/inventory';

interface DailyDashboardProps {
    inventoryHook: ReturnType<typeof useInventory>;
}

export default function DailyDashboard({ inventoryHook }: DailyDashboardProps) {
    const { prices, incoming, sales } = inventoryHook;
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    // 선택된 날짜의 입고 데이터
    const todayIncoming = useMemo(() => {
        return incoming.filter(i => i.date === selectedDate);
    }, [incoming, selectedDate]);

    // 선택된 날짜의 판매 데이터
    const todaySales = useMemo(() => {
        return sales.filter(s => s.date === selectedDate);
    }, [sales, selectedDate]);

    // '큰상자' 투입 누적 수량 계산
    const totalBigBox = useMemo(() => {
        return incoming.filter(i => i.type === '큰상자').reduce((sum, item) => sum + item.quantity, 0);
    }, [incoming]);

    // 각 품목별 재고 현황(Inventory Summary) 계산
    const inventorySummary = useMemo(() => {
        const summary: InventorySummary[] = prices.map(p => ({
            category: p.category,
            itemName: p.itemName,
            totalIncoming: 0,
            totalSales: 0,
            currentStock: 0,
            stockValue: 0
        }));

        // 전체 입고(판매대기) 누적
        incoming.filter(i => i.type === '판매대기').forEach(record => {
            const target = summary.find(s => s.category === record.category && s.itemName === record.itemName);
            if (target) {
                target.totalIncoming += record.quantity;
            }
        });

        // 전체 판매 누적
        sales.forEach(record => {
            const target = summary.find(s => s.category === record.category && s.itemName === record.itemName);
            if (target) {
                target.totalSales += record.quantity;
            }
        });

        // 현재고(입고-판매), 재고 가치 계산
        return summary.map(s => {
            const currentStock = s.totalIncoming - s.totalSales;
            const unitPrice = prices.find(p => p.category === s.category && p.itemName === s.itemName)?.price || 0;
            return {
                ...s,
                currentStock,
                stockValue: currentStock * unitPrice
            };
        }).filter(s => s.totalIncoming > 0 || s.totalSales > 0); // 거래 내역이 하나라도 있는 것만 표시

    }, [prices, incoming, sales]);

    const todayIncomingTotalValue = todayIncoming.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const todaySalesTotalValue = todaySales.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalInventoryValue = inventorySummary.reduce((sum, item) => sum + item.stockValue, 0);

    return (
        <div className="space-y-6">
            {/* 1. 날짜 및 개요 섹션 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm animate-fadeInUp">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        📊 일일 요약 및 누적 재고 현황
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        선택한 일자의 입·출고 데이터를 확인하고 전체 남은 재고를 조회합니다.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">조회 날짜</label>
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-auto"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                {/* 2. 입고 현황 */}
                <Card className="border-[#8b9e83]/30 dark:border-green-900/50">
                    <CardHeader className="bg-[#fcfbf9] dark:bg-gray-800 rounded-t-xl border-b border-[#e5dfd3] dark:border-gray-700">
                        <CardTitle className="text-[#4a5f41] dark:text-green-400">📥 해당 일자 신규 입고</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {todayIncoming.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>항목</TableHead>
                                        <TableHead className="text-right">수량</TableHead>
                                        <TableHead className="text-right">가치 (합계)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <tbody>
                                    {todayIncoming.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.type === '큰상자' ? '🧺 큰 상자' : `📦 ${item.category} ${item.itemName} (${item.boxType})`}
                                            </TableCell>
                                            <TableCell className="text-right text-gray-600 dark:text-gray-300">{item.quantity} 박스</TableCell>
                                            <TableCell className="text-right text-gray-600 dark:text-gray-300">
                                                {item.totalPrice ? `${item.totalPrice.toLocaleString()} 원` : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-green-50/50 dark:bg-green-900/10 !border-t border-[#e5dfd3] dark:border-green-800/50">
                                        <TableCell className="font-bold text-[#4a5f41] dark:text-green-400">당일 합계</TableCell>
                                        <TableCell className="text-right">-</TableCell>
                                        <TableCell className="text-right font-bold text-[#4a5f41] dark:text-green-400">{todayIncomingTotalValue.toLocaleString()} 원</TableCell>
                                    </TableRow>
                                </tbody>
                            </Table>
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">해당 날짜에 입고된 내역이 없습니다.</div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. 판매 현황 */}
                <Card className="border-blue-900/10">
                    <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 rounded-t-xl border-b border-blue-100 dark:border-blue-900/30">
                        <CardTitle className="text-blue-800 dark:text-blue-400">💸 해당 일자 판매 내역</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {todaySales.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>항목</TableHead>
                                        <TableHead className="text-right">수량</TableHead>
                                        <TableHead className="text-right">매출 금액</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <tbody>
                                    {todaySales.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">🍎 {item.category} {item.itemName}</TableCell>
                                            <TableCell className="text-right text-gray-600 dark:text-gray-300">{item.quantity} 박스</TableCell>
                                            <TableCell className="text-right text-gray-600 dark:text-gray-300">{item.totalPrice.toLocaleString()} 원</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="bg-blue-50/50 dark:bg-blue-900/10 !border-t border-blue-100 dark:border-blue-800/50">
                                        <TableCell className="font-bold text-blue-800 dark:text-blue-400">당일 매출 합계</TableCell>
                                        <TableCell className="text-right">-</TableCell>
                                        <TableCell className="text-right font-bold text-blue-800 dark:text-blue-400">{todaySalesTotalValue.toLocaleString()} 원</TableCell>
                                    </TableRow>
                                </tbody>
                            </Table>
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">해당 날짜에 판매된 내역이 없습니다.</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 4. 전일/누적 재고 현황 */}
            <Card className="border-gray-200 dark:border-gray-700 shadow-md animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
                    <div>
                        <CardTitle>📦 전체 누적 재고 (포장완료/판매대기 제품)</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">※ 누적 입고량 - 누적 판매량 = 현재고</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 flex flex-col items-end">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">(미포장) 누적 큰 상자</span>
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{totalBigBox.toLocaleString()} 🧺</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {inventorySummary.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>카테고리</TableHead>
                                    <TableHead>세부 품목</TableHead>
                                    <TableHead className="text-right">누적 입고</TableHead>
                                    <TableHead className="text-right text-blue-600 dark:text-blue-400">누적 판매</TableHead>
                                    <TableHead className="text-right text-green-700 dark:text-green-500">현재고 (잔여)</TableHead>
                                    <TableHead className="text-right font-semibold">재고 자산 밸류</TableHead>
                                </TableRow>
                            </TableHeader>
                            <tbody>
                                {inventorySummary.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{item.category}</TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-300">{item.itemName}</TableCell>
                                        <TableCell className="text-right text-gray-500">{item.totalIncoming}</TableCell>
                                        <TableCell className="text-right text-blue-600/80 dark:text-blue-400/80">{item.totalSales}</TableCell>
                                        <TableCell className="text-right font-bold text-green-700 dark:text-green-500">{item.currentStock}</TableCell>
                                        <TableCell className="text-right text-gray-700 dark:text-gray-200">{item.stockValue.toLocaleString()} 원</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-gray-50 dark:bg-gray-900/50 !border-t-2 border-gray-200 dark:border-gray-700">
                                    <TableCell colSpan={5} className="font-bold text-right text-gray-900 dark:text-gray-100">💰 현재 남은 재고 가치 총합계 :</TableCell>
                                    <TableCell className="text-right font-bold text-xl text-gray-900 dark:text-gray-100">{totalInventoryValue.toLocaleString()} 원</TableCell>
                                </TableRow>
                            </tbody>
                        </Table>
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">입고 내역이 존재하지 않아 재고를 산출할 수 없습니다.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
