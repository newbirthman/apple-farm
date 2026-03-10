import { useState, useMemo, useRef, useEffect } from 'react';
import type { Category } from '@/types/inventory';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select } from '@/components/ui';

interface SalesFormProps {
    onSuccess?: () => void;
    inventoryHook: ReturnType<typeof useInventory>;
}

// 전화번호 자동 포맷 (010-XXXX-XXXX)
function formatPhone(raw: string): string {
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

export default function SalesForm({ onSuccess, inventoryHook }: SalesFormProps) {
    const { prices, addSales, deliveryFee, deliveryFeeIsland, customers, upsertCustomer } = inventoryHook;

    // 1단계: 품목(cropType)
    const cropTypes = Array.from(new Set(prices.map(p => p.cropType || '사과')));
    const [cropType, setCropType] = useState(cropTypes.length > 0 ? cropTypes[0] : '사과');

    // 2단계: 카테고리
    const categoriesForCrop = useMemo(() =>
        Array.from(new Set(prices.filter(p => (p.cropType || '사과') === cropType).map(p => p.category))),
        [prices, cropType]
    );
    const [category, setCategory] = useState<Category>(categoriesForCrop[0] || '10kg');

    // 3단계: 아이템명
    const itemsInCategory = useMemo(() =>
        prices.filter(p => (p.cropType || '사과') === cropType && p.category === category).map(p => p.itemName),
        [prices, cropType, category]
    );
    const [itemName, setItemName] = useState(itemsInCategory[0] || '');

    // 4단계: 포장상태
    const [packagingStatus, setPackagingStatus] = useState<'도소매포장' | '택배포장' | '미포장' | '선택안함'>('선택안함');

    // 도서산간 체크
    const [isIsland, setIsIsland] = useState(false);

    // 고객 정보
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('010-');
    const [customerAddress, setCustomerAddress] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [quantity, setQuantity] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    // 택배비 (도서산간 체크에 따라)
    const appliedDeliveryFee = isIsland ? deliveryFeeIsland : deliveryFee;

    // 단가 계산
    const priceRecord = prices.find(p => (p.cropType || '사과') === cropType && p.category === category && p.itemName === itemName);
    const basePrice = priceRecord ? priceRecord.price : 0;
    const unitPrice = packagingStatus === '택배포장' ? basePrice + appliedDeliveryFee : basePrice;
    const numericQty = parseInt(quantity, 10) || 0;
    const totalPrice = numericQty * unitPrice;

    const handleCropChange = (newCrop: string) => {
        setCropType(newCrop);
        const cats = Array.from(new Set(prices.filter(p => (p.cropType || '사과') === newCrop).map(p => p.category)));
        setCategory(cats[0] || '');
        const items = prices.filter(p => (p.cropType || '사과') === newCrop && p.category === (cats[0] || '')).map(p => p.itemName);
        setItemName(items[0] || '');
    };

    const handleCategoryChange = (cat: string) => {
        setCategory(cat);
        const items = prices.filter(p => (p.cropType || '사과') === cropType && p.category === cat).map(p => p.itemName);
        setItemName(items[0] || '');
    };

    const filteredCustomers = useMemo(() =>
        customerName.length > 0 ? customers.filter(c => c.name.includes(customerName)) : [],
        [customers, customerName]
    );

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (numericQty <= 0) return alert('판매 수량을 1 이상 입력해주세요.');
        setIsSaving(true);
        try {
            if (packagingStatus === '택배포장' && customerName.trim() !== '') {
                await upsertCustomer({
                    name: customerName.trim(),
                    phone: customerPhone.trim(),
                    address: customerAddress.trim(),
                });
            }
            await addSales({
                date: new Date().toISOString().split('T')[0],
                cropType,
                packagingStatus: packagingStatus === '선택안함' ? undefined : packagingStatus,
                category, itemName,
                quantity: numericQty, unitPrice, totalPrice,
            });
            setQuantity('');
            setCustomerName(''); setCustomerPhone('010-'); setCustomerAddress(''); setIsIsland(false);
            if (onSuccess) onSuccess();
        } catch (err) { console.error(err); alert('저장 중 오류가 발생했습니다.'); }
        finally { setIsSaving(false); }
    };

    const packagingOptions = ['선택안함', '도소매포장', '택배포장', '미포장'] as const;

    return (
        <Card className="max-w-xl mx-auto border-blue-900/10 shadow-md">
            <CardHeader className="bg-blue-50/50 dark:bg-blue-900/20 rounded-t-xl border-b border-blue-100 dark:border-blue-900/30">
                <CardTitle className="text-blue-800 dark:text-blue-400 flex items-center gap-2">💸 상품 판매 등록</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5 animate-fadeInUp">
                    {/* 1. 품목 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">🌱 1. 품목</label>
                        <div className="flex flex-wrap gap-2">
                            {cropTypes.map(crop => (
                                <button key={crop} type="button" onClick={() => handleCropChange(crop)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${cropType === crop ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >{crop}</button>
                            ))}
                        </div>
                    </div>

                    {/* 2. 중량/형태 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">📦 2. 중량/형태</label>
                        <div className="flex flex-wrap gap-2">
                            {categoriesForCrop.map(cat => (
                                <button key={cat} type="button" onClick={() => handleCategoryChange(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${category === cat ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >{cat}</button>
                            ))}
                        </div>
                    </div>

                    {/* 3. 개수/크기 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">🍎 3. 개수/크기</label>
                        <div className="flex flex-wrap gap-2">
                            {itemsInCategory.map(item => (
                                <button key={item} type="button" onClick={() => setItemName(item)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${itemName === item ? 'bg-orange-500 text-white border-orange-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >{item || '기본'}</button>
                            ))}
                        </div>
                    </div>

                    {/* 4. 포장상태 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">📦 4. 포장상태</label>
                        <div className="flex flex-wrap gap-2">
                            {packagingOptions.map(status => (
                                <button key={status} type="button" onClick={() => { setPackagingStatus(status); if (status !== '택배포장') setIsIsland(false); }}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${packagingStatus === status ? 'bg-green-600 text-white border-green-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >{status}</button>
                            ))}
                        </div>
                    </div>

                    {/* 5. 택배 수령인 정보 */}
                    {packagingStatus === '택배포장' && (
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800/50 space-y-3">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">🚚 5. 택배 수령인 정보 (자동저장)</label>
                            <div className="relative" ref={dropdownRef}>
                                <Input
                                    placeholder="이름 (입력 시 기존 고객 검색)"
                                    value={customerName}
                                    onChange={e => { setCustomerName(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                />
                                {showDropdown && customerName.length > 0 && (
                                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {filteredCustomers.map(c => (
                                            <button key={c.id} type="button"
                                                onClick={() => { setCustomerName(c.name); setCustomerPhone(c.phone || '010-'); setCustomerAddress(c.address || ''); setShowDropdown(false); }}
                                                className="block w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                            >
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{c.name}</span>
                                                <span className="ml-2 text-xs text-gray-500">{c.phone} | {c.address}</span>
                                            </button>
                                        ))}
                                        {filteredCustomers.length === 0 && (
                                            <div className="px-4 py-3 text-sm text-gray-400">검색 결과 없음 (새 고객으로 자동 등록)</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Input
                                placeholder="전화번호"
                                value={customerPhone}
                                onChange={e => setCustomerPhone(formatPhone(e.target.value))}
                            />
                            <Input placeholder="주소" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} />

                            {/* 도서/산간 체크 */}
                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                                <input
                                    type="checkbox"
                                    checked={isIsland}
                                    onChange={e => setIsIsland(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">🏝️ 도서/산간지역</span>
                                {isIsland && (
                                    <span className="text-xs text-orange-500 font-bold">(택배비 {deliveryFeeIsland.toLocaleString()}원 적용)</span>
                                )}
                            </label>
                        </div>
                    )}

                    {/* 수량 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">📦 판매 수량</label>
                        <Input type="number" min="1" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="text-lg py-3" />
                    </div>

                    {/* 예상 매출 */}
                    <div className="flex justify-between items-center p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800/50 mt-2">
                        <div>
                            <span className="font-bold">💰 예상 매출</span>
                            {packagingStatus === '택배포장' && (
                                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                                    ({isIsland ? '도서산간' : '일반'} 택배비 {appliedDeliveryFee.toLocaleString()}원 포함)
                                </span>
                            )}
                        </div>
                        <span className="text-2xl font-extrabold">{totalPrice.toLocaleString()} <span className="text-lg font-medium">원</span></span>
                    </div>

                    <Button type="submit" variant="primary" className="w-full py-4 text-lg mt-4 bg-blue-600 hover:bg-blue-700 focus:ring-blue-600" disabled={isSaving}>
                        {isSaving ? '저장 중...' : '판매 등록하기'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
