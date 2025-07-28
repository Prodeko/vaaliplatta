"use client"

import { useBreadcrumb, BreadcrumbContextType } from "@/lib/hooks/useBreadcrumb"
import { useEffect } from "react";

interface BreadcrumbSetterParams {
    items: BreadcrumbContextType["items"]
}

function BreadcrumbSetter({ items }: BreadcrumbSetterParams) {
    const { setBreadcrumb } = useBreadcrumb()

    useEffect(() => {
        setBreadcrumb(items);
    }, [setBreadcrumb, items]);

    return <></>
}

BreadcrumbSetter.displayName = "BreadcrumbSetter"

export default BreadcrumbSetter