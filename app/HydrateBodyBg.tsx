"use client";

import { useEffect } from "react";

// this isn't needed right now, but will be once the bg gradient is dynamic
export function HyrdateBodyBg({ topColor }: { topColor: string }) {
    useEffect(() => {
        document.body.style.setProperty("--bg-gradient-top-color", topColor);
    }, []);

    return null;
}