import { useEffect, useRef, useState } from 'react';
import { Position, useAppState } from '../hooks/useAppState';
import { groupBy } from 'lodash';
import { useAuth } from '../hooks/useAuth';
import useToimarivisaView from '../hooks/useToimarivisaView';

interface DropdownProps {
    label: string;
    isOpen: boolean;
    onToggle: () => void;
    badge?: number;
    children: React.ReactNode;
}

function Dropdown({ label, isOpen, onToggle, badge, children }: DropdownProps) {
    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full p-4 text-black hover:bg-slate-200 rounded-md focus:outline-none"
                aria-expanded={isOpen}
                aria-controls={`${label}-dropdown`}
            >
                <span className="font-extrabold">{label}</span>
                <span className="flex items-center gap-2">
                    {badge !== undefined && (
                        <span className="rounded-full bg-blue-100 px-2 text-xs font-bold text-blue-800">{badge}</span>
                    )}
                    <span className={`text-black transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </span>
                </span>
            </button>
            <div
                id={`${label}-dropdown`}
                className={`origin-top transition-all transform ${isOpen ? 'scale-y-100' : 'scale-y-0'} overflow-hidden bg-white border-t-0 rounded-md shadow-lg`}
                style={isOpen ? {} : { maxHeight: '0' }}
            >
                {children}
            </div>
        </div>
    );
}

// Lower-cases and strips accents one UTF-16 unit at a time, so "paa" matches "Pääainevastaava"
// and an index into the folded string is also an index into the original one.
function fold(text: string) {
    let out = '';
    for (const c of text.split('')) {
        const base = c.normalize('NFD')[0] ?? c;
        out += base.toLowerCase()[0] ?? base;
    }
    return out;
}

function Highlighted({ text, start, length }: { text: string, start: number, length: number }) {
    if (start < 0) return <>{text}</>;
    return (
        <>
            {text.slice(0, start)}
            <mark className="rounded-sm bg-amber-200 px-px text-inherit">{text.slice(start, start + length)}</mark>
            {text.slice(start + length)}
        </>
    );
}

const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;
const modifierKey = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent) ? '⌘' : 'Ctrl';
const optionId = (p: Position) => `nav-search-option-${p.id}`;

export default function LeftNavBar() {
    const { election, position, getPosition } = useAppState();
    const { hallitus, vastuutoimarit, toimarit } = groupBy(election?.positions, p => p.category)
    const positionCategories = [
        { group: hallitus, label: "HALLITUS" },
        { group: vastuutoimarit, label: "VASTUUTOIMARIT" },
        { group: toimarit, label: "TOIMARIT" }
    ]
    const { session } = useAuth()
    const { openToimarivisa } = useToimarivisaView()

    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const needle = fold(query.trim());
    const isSearching = needle.length > 0;

    // Filter each category, numbering the results in display order so the arrow keys
    // can walk through them as one list across categories.
    let resultCount = 0;
    const categories = positionCategories.map(({ group, label }) => {
        const categoryMatches = isSearching && fold(label).includes(needle);
        const items = [...(group ?? [])]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(p => ({ position: p, hitStart: isSearching ? fold(p.name).indexOf(needle) : -1 }))
            .filter(item => !isSearching || categoryMatches || item.hitStart >= 0)
            .map(item => ({ ...item, resultIndex: resultCount++ }));
        return { label, items };
    });
    const results = categories.flatMap(c => c.items.map(item => ({ ...item, category: c.label })));
    const active = isSearching && results.length > 0 ? Math.min(activeIndex, results.length - 1) : -1;
    const activePosition = active >= 0 ? results[active].position : null;
    const currentPositionId = position && position !== "loading" ? position.id : null;

    // Ctrl/⌘ + F focuses the search. Pressed again while the search already has focus,
    // or while a modal is open, it is left to the browser's own find.
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'f') return;
            const input = inputRef.current;
            if (!input || document.activeElement === input) return;
            if (document.body.style.overflow === 'hidden') return; // Modal locks body scroll while open
            e.preventDefault();
            input.focus();
            input.select();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
        if (activePosition) document.getElementById(optionId(activePosition))?.scrollIntoView({ block: 'nearest' });
    }, [activePosition]);

    const openPosition = (p: Position, category: string) => {
        getPosition(p.id.toString());
        setQuery('');
        setActiveIndex(0);
        // Keep the chosen position visible in its category. On mobile the nav sits above
        // the content, so collapse it after a selection instead.
        setOpenCategories(prev => ({ ...prev, [category]: isDesktop() }));
        inputRef.current?.blur();
    };

    const clearSearch = () => {
        setQuery('');
        setActiveIndex(0);
        inputRef.current?.focus();
    };

    const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const count = results.length;
        if (e.key === 'ArrowDown' && count) {
            e.preventDefault();
            setActiveIndex((active + 1) % count);
        } else if (e.key === 'ArrowUp' && count) {
            e.preventDefault();
            setActiveIndex((active - 1 + count) % count);
        } else if (e.key === 'Home' && isSearching) {
            e.preventDefault();
            setActiveIndex(0);
        } else if (e.key === 'End' && isSearching && count) {
            e.preventDefault();
            setActiveIndex(count - 1);
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            openPosition(results[active].position, results[active].category);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            if (query) {
                setQuery('');
                setActiveIndex(0);
            } else {
                e.currentTarget.blur();
            }
        }
    };

    return (
        <div className="w-full">
            <div className="relative mb-1">
                <label htmlFor="nav-search" className="sr-only">Hae virkaa</label>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-[13px] h-[18px] w-[18px] text-gray-500">
                    <circle cx="8.5" cy="8.5" r="5.5" />
                    <path d="M13 13l4 4" />
                </svg>
                <input
                    id="nav-search"
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={isSearching}
                    aria-controls="nav-search-results"
                    aria-activedescendant={activePosition ? optionId(activePosition) : undefined}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Hae virkaa…"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                    onKeyDown={onSearchKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-16 text-[15px] font-medium text-gray-900 placeholder:text-gray-500 transition focus:border-blue-500 focus:outline-none focus:ring-[3px] focus:ring-blue-500/25"
                />
                {!isFocused && !query && (
                    <span aria-hidden="true" className="pointer-events-none absolute right-2.5 top-3.5 hidden items-center gap-[3px] text-[10px] font-bold text-gray-600 opacity-[.35] md:inline-flex">
                        <kbd className="rounded-[3px] border border-b-2 border-slate-300 bg-slate-100 px-1 font-sans leading-[14px]">{modifierKey}</kbd>
                        <span>+</span>
                        <kbd className="rounded-[3px] border border-b-2 border-slate-300 bg-slate-100 px-1 font-sans leading-[14px]">F</kbd>
                    </span>
                )}
                {query && (
                    <button
                        onClick={clearSearch}
                        onMouseDown={e => e.preventDefault()}
                        aria-label="Tyhjennä haku"
                        title="Tyhjennä (Esc)"
                        className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-4 w-4 text-gray-600">
                            <path d="M5 5l10 10M15 5L5 15" />
                        </svg>
                    </button>
                )}
            </div>

            <div aria-live="polite">
                {isSearching && (
                    <p className="px-1 pb-2 pt-1.5 text-xs font-semibold text-gray-600">
                        {results.length === 1 ? '1 osuma' : `${results.length} osumaa`}
                    </p>
                )}
            </div>

            <div id="nav-search-results">
                {categories.map(({ label, items }) => {
                    if (isSearching && items.length === 0) return null;
                    return (
                        <Dropdown
                            label={label}
                            key={label}
                            isOpen={isSearching || !!openCategories[label]}
                            onToggle={() => { if (!isSearching) setOpenCategories(prev => ({ ...prev, [label]: !prev[label] })); }}
                            badge={isSearching ? items.length : undefined}
                        >
                            {items.map(({ position: p, hitStart, resultIndex }) => {
                                const unread_count = p.applications.reduce((counter, a) => counter + (a.time ? 0 : 1), 0)
                                const all_count = p.applications.length
                                const all_count_text = all_count === 0
                                    ? ""
                                    : all_count === unread_count ? `( ${all_count} )` : all_count.toString()
                                const isActive = resultIndex === active
                                const isCurrent = !isSearching && p.id === currentPositionId

                                return (
                                    <button
                                        id={optionId(p)}
                                        onClick={() => openPosition(p, label)}
                                        onMouseMove={() => { if (isSearching && !isActive) setActiveIndex(resultIndex); }}
                                        className={`p-4 text-sm text-gray-700 hover:bg-blue-100 w-full flex items-start justify-between ${isActive ? 'bg-blue-100' : isCurrent ? 'bg-blue-50 font-bold' : ''}`}
                                        key={p.id}
                                    >
                                        <p className="text-left">
                                            <Highlighted text={p.name} start={hitStart} length={needle.length} />
                                        </p>
                                        <div className="flex flex-row-reverse flex-wrap justify-end gap-x-2">
                                            {all_count_text !== "" && (
                                                <p className='text-gray-500 whitespace-nowrap grow text-right'>{all_count_text}</p>
                                            )}
                                            {session && unread_count > 0 && (
                                                <p className='font-extrabold text-blue-500 grow text-right'>
                                                    {unread_count}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </Dropdown>
                    );
                })}

                {isSearching && results.length === 0 && (
                    <div className="flex flex-col items-center gap-2 px-4 py-6 text-center text-sm text-gray-600">
                        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className="h-7 w-7 text-gray-400">
                            <circle cx="8.5" cy="8.5" r="5.5" />
                            <path d="M13 13l4 4" />
                        </svg>
                        <p>Ei osumia haulle <strong className="text-gray-900">“{query.trim()}”</strong></p>
                        <button onClick={clearSearch} className="text-blue-700 underline hover:text-blue-900">Tyhjennä haku</button>
                    </div>
                )}
            </div>

            {election?.show_toimarivisa && !isSearching && (
                <button
                    onClick={openToimarivisa}
                    className="mt-2 flex items-center justify-between w-full p-4 text-black bg-blue-50 hover:bg-blue-100 rounded-md focus:outline-none"
                >
                    <span className="font-extrabold">TOIMARIVISA</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    );
}
