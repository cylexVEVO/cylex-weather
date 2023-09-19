"use client";

import React, { useEffect, useRef } from "react";
import { MetNoData } from "./page";

export function ForecastContainer({ children, timeseries }: { children: React.ReactNode, timeseries: MetNoData["properties"]["timeseries"] }) {
    const ref = useRef<HTMLOListElement>(null);

    // scroll forecast container to current card
    useEffect(() => {
        const hour = new Date().getHours();
        const idx = timeseries.findIndex((entry) => new Date(entry.time).getHours() === hour) ?? 0;
        ref.current?.scrollTo({ left: (idx * 280) + (idx * 5) });
    }, []);

    return (
        <ol ref={ref} className="flex h-full overflow-auto rounded-[5px] gap-x-[5px] pb-1 sb">
            {children}
        </ol>
    );
}