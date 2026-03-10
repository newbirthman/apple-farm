'use client';

import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui';

const WEIGHT_UNITS = ['Kg', 'g', '망', '단', '개'];
const ITEM_UNITS = ['과', '개', '단(묶음)'];

interface ProductManagerProps {
    inventoryHook: ReturnType<typeof useInventory>;
    onSuccess?: () => void;
}

export default function ProductManager({ inventoryHook, onSuccess }: ProductManagerProps) {
    const [cropType, setCropType] = useState('');
    const [weightValue, setWeightValue] = useState(10);
    const [weightUnit, setWeightUnit] = useState('Kg');
    const [itemValue, setItemValue] = useState(20);
    const [itemUnit, setItemUnit] = useState('과');
    const [price, setPrice] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const adjustWeight = (delta: number) => setWeightValue(prev => Math.max(0, prev + delta));
    const adjustItem = (delta: number) => setItemValue(prev => Math.max(0, prev + delta));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cropType.trim()) return alert('품목(농산물 종류)은 필수 입력 사항입니다.');

        const finalCategory = (weightValue > 0 ? `${weightValue}${weightUnit}` : weightUnit).trim();
        const finalItemName = (itemValue > 0 ? `${itemValue}${itemUnit}` : itemUnit).trim() || '기본';
        const finalPrice = parseInt(price.replace(/,/g, ''), 10) || 0;

        setIsSubmitting(true);
        try {
            await inventoryHook.addPriceItem({
                cropType: cropType.trim(),
                category: finalCategory,
                itemName: finalItemName,
                price: finalPrice
            });
            alert('새로운 상품이 단가표에 등록되었습니다.');
            // 품목(cropType)은 유지, 나머지만 초기화
            setWeightValue(10);
            setWeightUnit('Kg');
            setItemValue(20);
            setItemUnit('과');
            setPrice('');
            // 탭 이동 안 함 (onSuccess 호출 안 함)
        } catch (err: any) {
            alert('오류: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepperBtnClass = "px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";

    return (
        <Card className="max-w-xl mx-auto">
            <CardHeader className="bg-green-50/50 dark:bg-green-900/20 rounded-t-xl border-b border-green-100 dark:border-green-900/30">
                <CardTitle className="text-green-800 dark:text-green-400">🌱 새로운 농산물 단위 등록</CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    자주 사용하는 단위를 조합하여 규격을 생성합니다. 숫자를 0으로 설정하면 단위명만 등록됩니다.
                </p>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. 품목 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">1. 품목 (연속 등록 시 값 유지)</label>
                        <Input placeholder="예: 사과, 배, 복숭아, 배추..." value={cropType} onChange={e => setCropType(e.target.value)} className="text-base py-3" />
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* 2. 분류/중량 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            2. 분류/중량: <span className="text-green-600 dark:text-green-400">{weightValue > 0 ? `${weightValue}${weightUnit}` : weightUnit}</span>
                        </label>
                        <div className="flex items-center gap-2 mb-3">
                            <button type="button" onClick={() => adjustWeight(-10)} className={stepperBtnClass}>-10</button>
                            <button type="button" onClick={() => adjustWeight(-5)} className={stepperBtnClass}>-5</button>
                            <button type="button" onClick={() => adjustWeight(-1)} className={stepperBtnClass}>-1</button>
                            <Input
                                type="number" value={weightValue} onChange={e => setWeightValue(Math.max(0, parseInt(e.target.value) || 0))}
                                className="flex-1 text-center text-lg font-bold py-2"
                            />
                            <button type="button" onClick={() => adjustWeight(1)} className={stepperBtnClass}>+1</button>
                            <button type="button" onClick={() => adjustWeight(5)} className={stepperBtnClass}>+5</button>
                            <button type="button" onClick={() => adjustWeight(10)} className={stepperBtnClass}>+10</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {WEIGHT_UNITS.map(unit => (
                                <button key={unit} type="button" onClick={() => setWeightUnit(unit)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${weightUnit === unit
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >{unit}</button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* 3. 수량/개수 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            3. 수량(개수): <span className="text-orange-500">{itemValue > 0 ? `${itemValue}${itemUnit}` : itemUnit}</span>
                        </label>
                        <div className="flex items-center gap-2 mb-3">
                            <button type="button" onClick={() => adjustItem(-10)} className={stepperBtnClass}>-10</button>
                            <button type="button" onClick={() => adjustItem(-5)} className={stepperBtnClass}>-5</button>
                            <button type="button" onClick={() => adjustItem(-1)} className={stepperBtnClass}>-1</button>
                            <Input
                                type="number" value={itemValue} onChange={e => setItemValue(Math.max(0, parseInt(e.target.value) || 0))}
                                className="flex-1 text-center text-lg font-bold py-2"
                            />
                            <button type="button" onClick={() => adjustItem(1)} className={stepperBtnClass}>+1</button>
                            <button type="button" onClick={() => adjustItem(5)} className={stepperBtnClass}>+5</button>
                            <button type="button" onClick={() => adjustItem(10)} className={stepperBtnClass}>+10</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {ITEM_UNITS.map(unit => (
                                <button key={unit} type="button" onClick={() => setItemUnit(unit)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${itemUnit === unit
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >{unit}</button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700" />

                    {/* 4. 단가 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">4. 기준 단가</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="text" placeholder="0" value={price}
                                onChange={e => {
                                    const num = e.target.value.replace(/[^0-9]/g, '');
                                    setPrice(num ? parseInt(num, 10).toLocaleString() : '');
                                }}
                                className="flex-1 text-right text-lg font-bold py-3"
                            />
                            <span className="text-gray-500 font-bold">원</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400">
                        💡 상품 등록 시 단가를 지정할 수 있습니다. 입력된 단가는 즉시 단가표에 반영되며 언제든 수정 가능합니다.
                    </div>

                    <Button type="submit" variant="primary" className="w-full py-4 text-lg" disabled={isSubmitting}>
                        {isSubmitting ? '저장 중...' : '단가표에 상품 등록하기'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
