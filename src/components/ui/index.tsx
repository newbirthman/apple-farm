import React from 'react';

// Card
export function Card({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`} {...props}>{children}</div>;
}
export function CardHeader({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 ${className}`}>{children}</div>;
}
export function CardTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <h3 className={`text-lg font-bold text-gray-900 dark:text-gray-100 ${className}`}>{children}</h3>;
}
export function CardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}

// Button
export function Button({
    children, variant = 'primary', className = '', ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }) {
    const base = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        primary: "bg-[#6c8561] text-white hover:bg-[#5b7250] focus:ring-[#6c8561]",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    };
    return (
        <button className={`${base} ${variants[variant]} px-4 py-2 text-sm ${className}`} {...props}>
            {children}
        </button>
    );
}

// Input
export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-[#6c8561] focus:outline-none focus:ring-1 focus:ring-[#8b9e83] transition-colors ${className}`}
            {...props}
        />
    );
}

// Select
export function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select
            className={`block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-[#6c8561] focus:outline-none focus:ring-1 focus:ring-[#8b9e83] transition-colors appearance-none ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}

// Table
export function Table({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <div className={`w-full overflow-x-auto ${className}`}><table className="w-full text-sm text-left">{children}</table></div>;
}
export function TableHeader({ children }: { children: React.ReactNode }) {
    return <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/50 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{children}</thead>;
}
export function TableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <tr className={`border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${className}`}>{children}</tr>;
}
export function TableHead({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <th className={`px-4 py-3 font-medium ${className}`}>{children}</th>;
}
export function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return <td className={`px-4 py-3 ${className}`} {...props}>{children}</td>;
}

// Tabs
export function Tabs({
    tabs, activeTab, onChange
}: {
    tabs: { id: string; label: string; icon?: React.ReactNode }[],
    activeTab: string,
    onChange: (id: string) => void
}) {
    return (
        <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 overflow-x-auto">
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                )
            })}
        </div>
    );
}
