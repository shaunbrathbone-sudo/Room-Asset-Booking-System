'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Monitor, Building2, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { SearchResult } from '@/types/spatial';

const ICON_MAP = {
    desk: Monitor,
    meeting_room: MapPin,
    office: Building2,
    user: User,
} as const;

const TYPE_LABELS = {
    desk: 'Desk',
    meeting_room: 'Meeting Room',
    office: 'Office',
    user: 'Colleague',
} as const;

export const UniversalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timeout = setTimeout(async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get<SearchResult[]>('/search', { params: { q: query } });
                setResults(data);
                setIsOpen(true);
            } catch {
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [query]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Keyboard shortcut: Ctrl+K
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const handleSelect = useCallback((result: SearchResult) => {
        const { countrySlug, officeSlug, floorSlug } = result.navigation;

        if (floorSlug) {
            router.push(`/explore/${countrySlug}/${officeSlug}/${floorSlug}`);
        } else if (officeSlug) {
            router.push(`/explore/${countrySlug}/${officeSlug}`);
        } else if (countrySlug) {
            router.push(`/explore/${countrySlug}`);
        }

        setIsOpen(false);
        setQuery('');
    }, [router]);

    // Group results by type
    const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
        if (!acc[r.type]) acc[r.type] = [];
        acc[r.type].push(r);
        return acc;
    }, {});

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    placeholder="Search desks, rooms, colleagues... (Ctrl+K)"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    aria-label="Universal search"
                    aria-expanded={isOpen}
                    role="combobox"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                        aria-label="Clear search"
                    >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                )}
            </div>

            {/* Results dropdown */}
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto z-50">
                    {isLoading && (
                        <div className="p-4 text-center text-slate-400 text-sm">Searching...</div>
                    )}

                    {!isLoading && results.length === 0 && query.length >= 2 && (
                        <div className="p-4 text-center text-slate-400 text-sm">No results found</div>
                    )}

                    {Object.entries(grouped).map(([type, items]) => {
                        const Icon = ICON_MAP[type as keyof typeof ICON_MAP];
                        const label = TYPE_LABELS[type as keyof typeof TYPE_LABELS];

                        return (
                            <div key={type}>
                                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                                    {label}s
                                </div>
                                {items.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelect(result)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                                    >
                                        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{result.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{result.subtitle}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};