"use client"

import { createContext, useContext, useState, ReactNode } from "react";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

export type BreadcrumbContextType = {
    items: BreadcrumbItem[];
    setBreadcrumb: (items: BreadcrumbItem[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<BreadcrumbItem[]>([]);

    const setBreadcrumb = (newItems: BreadcrumbItem[]) => {
        setItems(newItems);
    };

    return (
        <BreadcrumbContext.Provider value={{ items, setBreadcrumb }}>
            {children}
        </BreadcrumbContext.Provider>
    );
}

export function useBreadcrumb() {
    const ctx = useContext(BreadcrumbContext);
    if (!ctx) {
        throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
    }
    return ctx;
}
