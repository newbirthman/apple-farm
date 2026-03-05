import { useState, useMemo } from 'react';
import type { IncomingType, BoxType, Category } from '@/types/inventory';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Tabs } from '@/components/ui';

interface IncomingFormProps {
    onSuccess?: () => void;
    inventoryHook: ReturnType<typeof useInventory>;
}

export default function IncomingForm({ onSuccess, inventoryHook }: IncomingFormProps) {
    const { prices, getPrice, addIncoming } = inventoryHook;

    const [formMode, setFormMode] = useState<IncomingType>('판매대기');
    const [boxType, setBoxType] = useState<BoxType>('택배');
    const [category, setCategory] = useState<Category>('10kg');
    const [itemName, setItemName] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const currentCategoryItems = useMemo(() => {
        return prices.filter(p => p.category === category);
    }, [prices, category]);

    // 카테고리가 바뀔 때 첫번째 아이템으로 자동 설정
    useMemo(() => {
        if (currentCategoryItems.length > 0 && !currentCategoryItems.find(i => i.itemName === itemName)) {
            setItemName(currentCategoryItems[0].itemName);
        }
    }, [category, currentCategoryItems, itemName]);

    const unitPrice = getPrice(category, itemName);
    const numericQty = parseInt(quantity, 10) || 0;
    const totalPrice = numericQty * unitPrice;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (numericQty <= 0) return alert('수량을 1 이상 입력해주세요.');
        setIsSaving(true);

        try {
            if (formMode === '큰상자') {
                await addIncoming({
                    date: new Date().toISOString().split('T')[0],
                    type: '큰상자',
                    quantity: numericQty,
                });
            } else {
                await addIncoming({
                    date: new Date().toISOString().split('T')[0],
                    type: '판매대기',
                    boxType,
                    category,
                    itemName,
                    quantity: numericQty,
                    unitPrice,
                    totalPrice,
                });
            }
            setQuantity('');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            alert('저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="max-w-xl mx-auto border-[#8b9e83]/30 dark:border-green-900/50 shadow-md">
            <CardHeader className="bg-[#fcfbf9] dark:bg-gray-800 rounded-t-xl border-b border-[#e5dfd3] dark:border-gray-700">
                <CardTitle className="text-[#4a5f41] dark:text-green-400 flex items-center gap-2">
                    📥 농장 신규 입고 등록
                </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
                <Tabs
                    tabs={[
                        { id: '판매대기', label: '📦 판매 대기 (포장완료)' },
                        { id: '큰상자', label: '🧺 큰 상자 (수확 직후)' }
                    ]}
                    activeTab={formMode}
                    onChange={(id) => setFormMode(id as IncomingType)}
                />

                <form onSubmit={handleSubmit} className="space-y-5 mt-6 animate-fadeInUp">
                    {formMode === '판매대기' ? (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">박스 분류</label>
                                    <Select value={boxType} onChange={(e) => setBoxType(e.target.value as BoxType)}>
                                        <option value="택배">📦 택배용</option>
                                        <option value="수령">🤝 방문 수령용</option>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        <Select value={itemName} onChange={(e) => setItemName(e.target.value)}>
                                            {currentCategoryItems.map(item => (
                                                <option key={item.id} value={item.itemName}>{item.itemName}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-center text-sm mb-1 text-gray-600 dark:text-gray-400">
                                        <span>적용 단가 (기준표)</span>
                                        <span className="font-semibold">{unitPrice.toLocaleString()} 원</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-4 bg-[#fcfaf5] dark:bg-yellow-900/10 rounded-xl border border-[#e5dfd3] dark:border-yellow-900/30 mb-4">
                            <p className="text-sm text-[#8a7246] dark:text-yellow-600">
                                💡 수확 직후의 <strong>'큰 상자'</strong>는 상품 분류나 가격 없이 총 수량만 재고로 누적 관리됩니다.
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            입고 수량 (박스/상자)
                        </label>
                        <Input
                            type="number"
                            min="1"
                            placeholder="숫자만 입력"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            className="text-lg py-3"
                        />
                    </div>

                    {formMode === '판매대기' && numericQty > 0 && (
                        <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800/50">
                            <span className="font-bold">예상 매출 가치</span>
                            <span className="text-xl font-extrabold">{totalPrice.toLocaleString()} 원</span>
                        </div>
                    )}

                    <Button type="submit" variant="primary" className="w-full py-4 text-lg mt-2" disabled={isSaving}>
                        {isSaving ? '저장 중...' : '입고 내역 저장하기'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
