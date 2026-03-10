'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '@/components/ui';
import { Search, Edit2, Trash2, Check, X, Users } from 'lucide-react';
import type { Customer } from '@/types/inventory';

export default function CustomerManager() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAddress, setEditAddress] = useState('');

    // 고객 목록 로드
    const loadCustomers = async () => {
        setIsLoading(true);
        const { data } = await supabase.from('customers').select('*').order('name', { ascending: true });
        setCustomers(data || []);
        setIsLoading(false);
    };

    useEffect(() => { loadCustomers(); }, []);

    // 검색 필터
    const filteredCustomers = useMemo(() => {
        if (searchQuery.trim().length === 0) return customers;
        return customers.filter(c =>
            c.name.includes(searchQuery) ||
            (c.phone || '').includes(searchQuery) ||
            (c.address || '').includes(searchQuery)
        );
    }, [customers, searchQuery]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`정말 [${name}] 고객을 삭제하시겠습니까?`)) return;
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) return alert('삭제 오류: ' + error.message);
        setCustomers(prev => prev.filter(c => c.id !== id));
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        const { data, error } = await supabase
            .from('customers')
            .upsert({ id: editingId, name: editName.trim(), phone: editPhone.trim(), address: editAddress.trim() })
            .select().single();
        if (error) return alert('저장 오류: ' + error.message);
        if (data) setCustomers(prev => prev.map(c => c.id === data.id ? data : c));
        setEditingId(null);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fadeInUp">
                <span className="animate-spin w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">고객 데이터를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm animate-fadeInUp">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    👥 고객 관리
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    판매관리에서 택배포장 선택 시 자동으로 등록된 고객을 관리합니다.
                </p>
            </div>

            {/* 검색 바 */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="이름, 전화번호, 주소로 검색..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                />
                {searchQuery.length > 0 && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* 건수 표시 */}
            <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                <Users className="w-4 h-4 inline mr-1" />
                전체 {customers.length}명
                {searchQuery.length > 0 && ` · 검색 결과 ${filteredCustomers.length}명`}
            </p>

            {/* 고객 목록 */}
            {filteredCustomers.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <p className="text-gray-400 dark:text-gray-500">
                            {searchQuery.length > 0 ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다.\n판매관리에서 택배포장 선택 시 자동으로 등록됩니다.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {filteredCustomers.map(c => {
                        const isEditing = editingId === c.id;

                        return (
                            <Card key={c.id} className="animate-fadeInUp">
                                <CardContent className="py-4">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="이름" />
                                            <Input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="전화번호" />
                                            <Input value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="주소" />
                                            <div className="flex gap-2">
                                                <Button variant="primary" className="flex-1" onClick={handleSaveEdit}>저장</Button>
                                                <Button variant="secondary" className="flex-1" onClick={() => setEditingId(null)}>취소</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-base">👤 {c.name}</p>
                                                {c.phone && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📞 {c.phone}</p>}
                                                {c.address && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">📍 {c.address}</p>}
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(c.id);
                                                        setEditName(c.name);
                                                        setEditPhone(c.phone || '');
                                                        setEditAddress(c.address || '');
                                                    }}
                                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600 transition-colors"
                                                    title="수정"
                                                ><Edit2 className="w-4 h-4" /></button>
                                                <button
                                                    onClick={() => handleDelete(c.id, c.name)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                                                    title="삭제"
                                                ><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
