"use client";

import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage,
} from "./ui/breadcrumb";
import { useBreadcrumb } from "@/lib/hooks/useBreadcrumb";
import { Fragment } from "react";

export default function AppBreadcrumb() {
    const { items } = useBreadcrumb()
    if (items.length === 0) return null
    const renderedItems = [{ href: "/", label: "Vaaliplatta" }, ...items]

    const breadCrumbListComponents = renderedItems.map((item, idx) => {
        const isLast = idx === renderedItems.length - 1;

        return (
            <Fragment key={item.href ?? item.label + idx}>
                <BreadcrumbItem className="capitalize">
                    {isLast || !item.href ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
            </Fragment>
        )
    })

    return (
        <Breadcrumb className="hidden sm:block m-4">
            <BreadcrumbList>
                {breadCrumbListComponents}
            </BreadcrumbList>
        </Breadcrumb>
    )
}