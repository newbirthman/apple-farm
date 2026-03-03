import { useState, useMemo } from 'react';
import type { Category } from '@/types/inventory';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui';

interface SalesFormProps {
    onSuccess?: () => void;
    inventoryHook: ReturnType<typeof useInventory>;
}

export default function SalesForm({ onSuccess, inventoryHook }: SalesFormProps) {
    const { prices, getPrice, addSales } = inventoryHook;

    const [category, setCategory] = useState<Category>('10kg');
    const [itemName, setItemName] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [customPrice, setCustomPrice] = useState<string>('');

    const currentCategoryItems = useMemo(() => {
        return prices.filter(p => p.category === category);
    }, [prices, category]);

    useMemo(() => {
        if (currentCategoryItems.length > 0 && !currentCategoryItems.find(i => i.itemName === itemName)) {
            setItemName(currentCategoryItems[0].itemName);
            setCustomPrice(''); // 품목 변경 시 단가 리셋
        }
    }, [category, currentCategoryItems, itemName]);

    // 기준 단가 가져오기
    const basePrice = getPrice(category, itemName);

    // 사용자가 단가를 직접 입력했다면 그 값을, 아니면 기준 단가를 사용 (0일 경우 빈 문자열로 두어 힌트 표시)
    const appliedPrice = customPrice !== '' ? parseInt(customPrice, 10) || 0 : basePrice;
    const numericQty = parseInt(quantity, 10) || 0;
    const totalPrice = numericQty * appliedPrice;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (numericQty <= 0) return alert('판매 수량을 1 이상 입력해주세요.');
        if (appliedPrice <= 0) return alert('판매 단가를 확인해주세요.');

        addSales({
            date: new Date().toISOString().split('T')[0],
            category,
            itemName,
            quantity: numericQty,
            unitPrice: appliedPrice,
            totalPrice,
        });

        setQuantity('');
        setCustomPrice('');
        if (onSuccess) onSuccess();
    };

    return (
        <Card className="max-w-xl mx-auto border-blue-900/10 shadow-md">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 rounded-t-xl border-b border-blue-100 dark:border-blue-900/30">
                <CardTitle className="text-blue-800 dark:text-blue-400 flex items-center gap-2">
                    💸 상품 판매 등록
                </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5 animate-fadeInUp">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">상품 분류</label>
                            <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                                <option value="10kg">🍎 10kg 박스</option>
                                <option value="5kg">🍎 5kg 박스</option>
                                <option value="사과즙">🧃 사과즙</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">상세 품목</label>
                            <Select value={itemName} onChange={(e) => {
                                setItemName(e.target.value);
                                setCustomPrice('');
                            }}>
                                {currentCategoryItems.map(item => (
                                    <option key={item.id} value={item.itemName}>{item.itemName}</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                판매 수량
                            </label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="0"
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                className="text-lg py-3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex justify-between">
                                <span>실제 판매 단가</span>
                                <span className="text-xs font-normal text-gray-400">(기준: {basePrice.toLocaleString()})</span>
                            </label>
                            <Input
                                type="number"
                                placeholder={basePrice.toString()}
                                value={customPrice}
                                onChange={e => setCustomPrice(e.target.value)}
                                className="text-lg py-3"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800/50 mt-2">
                        <span className="font-bold">총 판매 금액</span>
                        <span className="text-2xl font-extrabold">{totalPrice.toLocaleString()} <span className="text-lg font-medium">원</span></span>
                    </div>

                    <Button type="submit" variant="primary" className="w-full py-4 text-lg mt-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-600">
                        판매 내역 저장하기
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
