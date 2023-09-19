import { redirect } from "next/navigation";
import { z } from "zod";
import { GeoButton } from "./GeoButton";

export default function Page() {
    async function goToWeather(formData: FormData) {
        "use server";

        const parsed = z.object({
            lat: z.string(),
            lon: z.string()
        }).parse({
            lat: formData.get("lat"),
            lon: formData.get("lon")
        });

        redirect(`/?lat=${parsed.lat}&lon=${parsed.lon}`);
    }

    return (
        <div className="h-screen max-h-screen overflow-hidden bg-gradient-to-b from-[#1e3c58] to-[#081018] flex">
            <main className="grow h-full flex items-center justify-center text-white">
                <div className="max-w-lg w-full mx-4 md:mx-0">
                    <h1 className="text-3xl font-bold mb-4">
                        Select your location
                    </h1>
                    <GeoButton />
                    <p className="my-2 text-center opacity-75">
                        or
                    </p>
                    <form action={goToWeather} className="flex flex-col gap-[5px] lg:max-w-lg lg:w-screen">
                        <input name="lat" placeholder="Latitude" className="p-2 rounded-[5px] bg-white/10" />
                        <input name="lon" placeholder="Longitude" className="p-2 rounded-[5px] bg-white/10 mb-2" />
                        <button className="p-2 px-6 rounded-[5px] bg-white/10 hover:bg-white/20 w-fit self-end">
                            Submit
                            </button>
                    </form>
                </div>
            </main>
        </div>
    );
}