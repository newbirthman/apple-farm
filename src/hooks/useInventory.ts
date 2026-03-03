import { useState, useCallback } from 'react';
import type { Category, PriceItem, IncomingRecord, SalesRecord, IncomingType, BoxType } from '@/types/inventory';

// 초기 가격 데이터 설정 (예시 단가 적용, 추후 관리자가 수정 가능)
const INITIAL_PRICES: PriceItem[] = [
    { id: 'p1', category: '10kg', itemName: '20과', price: 100000 },
    { id: 'p2', category: '10kg', itemName: '22과', price: 90000 },
    { id: 'p3', category: '10kg', itemName: '26과', price: 80000 },
    { id: 'p4', category: '10kg', itemName: '30과', price: 70000 },
    { id: 'p5', category: '10kg', itemName: '40과', price: 60000 },
    { id: 'p6', category: '10kg', itemName: '42과', price: 55000 },
    { id: 'p7', category: '10kg', itemName: '46과', price: 50000 },
    { id: 'p8', category: '10kg', itemName: '50과', price: 45000 },

    { id: 'p9', category: '5kg', itemName: '10과', price: 55000 },
    { id: 'p10', category: '5kg', itemName: '11과', price: 50000 },
    { id: 'p11', category: '5kg', itemName: '13과', price: 45000 },
    { id: 'p12', category: '5kg', itemName: '15과', price: 40000 },
    { id: 'p13', category: '5kg', itemName: '17과', price: 35000 },

    { id: 'p14', category: '사과즙', itemName: '1박스', price: 25000 },
    { id: 'p15', category: '사과즙', itemName: '2박스', price: 48000 },
    { id: 'p16', category: '사과즙', itemName: '3박스', price: 70000 },
];

export function useInventory() {
    const [prices, setPrices] = useState<PriceItem[]>(INITIAL_PRICES);
    const [incoming, setIncoming] = useState<IncomingRecord[]>([]);
    const [sales, setSales] = useState<SalesRecord[]>([]);

    // 단가 수정 메서드
    const updatePrice = useCallback((id: string, newPrice: number) => {
        setPrices(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
    }, []);

    // 특정 품목의 단가 가져오기
    const getPrice = useCallback((category: Category, itemName: string): number => {
        const item = prices.find(p => p.category === category && p.itemName === itemName);
        return item ? item.price : 0;
    }, [prices]);

    // 입고 기록 추가
    const addIncoming = useCallback((record: Omit<IncomingRecord, 'id'>) => {
        const newRecord: IncomingRecord = {
            ...record,
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        };
        setIncoming(prev => [newRecord, ...prev]);
    }, []);

    // 판매 기록 추가
    const addSales = useCallback((record: Omit<SalesRecord, 'id'>) => {
        const newRecord: SalesRecord = {
            ...record,
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        };
        setSales(prev => [newRecord, ...prev]);
    }, []);

    return {
        prices,
        incoming,
        sales,
        updatePrice,
        getPrice,
        addIncoming,
        addSales,
    };
}
