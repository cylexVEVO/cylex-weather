"use client";

import React, { useEffect, useRef } from "react";

export function ForecastContainer({ children, currentIdx }: { children: React.ReactNode, currentIdx: number }) {
    const ref = useRef<HTMLOListElement>(null);

    // scroll forecast container to current card
    useEffect(() => {
        ref.current?.scrollTo({ left: (currentIdx * 280) + (currentIdx * 5) });
    }, []);

    return (
        <ol ref={ref} className="flex overflow-auto rounded-[5px] gap-x-[5px] pb-1 sb">
            {children}
        </ol>
    );
}