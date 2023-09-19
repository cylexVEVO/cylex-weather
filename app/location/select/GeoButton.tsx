"use client";

import { useRouter } from "next/navigation";

export function GeoButton() {
    const router = useRouter();

    return (
        <button onClick={() => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition((position) => {
                    router.push(`/?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                }, (e) => {
                    console.error(e);
                    alert("Failed to get current location. Please manually enter your location.");
                }, { enableHighAccuracy: true });
            } else {
                alert("Your browser does not support supplying websites with geolocation data.");
            }
        }} className="p-2 px-6 rounded-[5px] bg-white/10 hover:bg-white/20 w-full">
            Use current location
        </button>
    );
}