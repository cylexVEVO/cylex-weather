import { redirect } from "next/navigation";
import { ForecastContainer } from "./ForecastContainer";

export type MetNoData = {
  properties: {
    timeseries: {
      time: string,
      data: {
        instant: {
          details?: {
            air_temperature?: number,
            relative_humidity?: number
          }
        },
        next_1_hours?: {
          summary?: {
            symbol_code?: string
          }
        }
      }
    }[]
  }
};

function cToF(c: number) {
  return Math.round(c * 1.8 + 32);
}

export default async function Page({ searchParams: { lat, lon } }: { searchParams: { lat: string, lon: string }}) {
  if (!lat || !lon) redirect("/location/select");

  const data = await (await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`, { headers: { "user-agent": "cylex Weather - https://weather.cylex.dog - cylex@cylex.dog" } })).json() as MetNoData | undefined | null;

  const current = data?.properties.timeseries.find((entry) => new Date(entry.time).getHours() === new Date().getHours());

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gradient-to-b from-[#3F7AB0] to-[#16293C] flex">
      <main className="grid grid-rows-[auto,_max-content] grow max-h-screen">
        <section aria-label="current weather">
          <div aria-hidden="true" className="text-[15px] flex items-center gap-2 pt-4 px-4 lg:pt-20 lg:px-20 mb-4 text-white">
            <img src="/location.svg" />
            <span className="opacity-75">
              {lat}, {lon}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 lg:p-20 pt-0 lg:pt-0">
            <div className="text-5xl font-bold text-white flex items-center gap-9">
              <img aria-hidden="true" src="/cloud.svg" />
              <h1>
                {data && cToF(data.properties.timeseries[0].data.instant.details?.air_temperature ?? 0)}°
              </h1>
            </div>
            <ul className="flex items-center gap-[5px]">
              <li className="bg-white/10 rounded-[5px] text-white p-5 w-48">
                <h1 className="font-semibold opacity-75 text-[10px] text-xs">
                  Low / High
                </h1>
                <p className="font-bold text-2xl">
                  00° / 00°
                </p>
              </li>
              <li className="bg-white/10 rounded-[5px] text-white p-5 w-48">
                <h1 className="font-semibold opacity-75 text-[10px] text-xs">
                  Humidity
                </h1>
                <p className="font-bold text-2xl">
                  {Math.round(current?.data.instant.details?.relative_humidity ?? 0) ?? "00"}%
                </p>
              </li>
            </ul>
          </div>
        </section>
        <section aria-label="forecast" className="p-4 lg:p-20 pt-0 grid">
          <ForecastContainer timeseries={data?.properties.timeseries ?? []}>
            {data?.properties.timeseries.filter((entry) => {
              const entryDate = new Date(entry.time);
              const currentDate = new Date();

              return entryDate.getDate() === currentDate.getDate();
            }).map((x) => {
              const date = new Date(x.time);
              return (
                <li key={x.time} className="bg-white/10 rounded-[5px] h-80 min-w-[280px] max-w-[280px] p-8 text-white">
                  <h1 className="font-semibold mb-2">
                    {date.getHours() === new Date().getHours() ?
                      "Now" :
                      <>
                        {date.getHours()}:{date.getMinutes().toString().length === 1 ? "0" : ""}{date.getMinutes()}
                      </>
                    }
                  </h1>
                  <div className="font-bold text-5xl flex items-center gap-4 mb-4">
                    <img aria-hidden="true" src="/cloud.svg" width={44} />
                    <p>
                      {cToF(x.data.instant.details?.air_temperature ?? 0)}°
                    </p>
                  </div>
                  <div className="text-xs opacity-75">
                    <p>
                      {Math.round(x.data.instant.details?.relative_humidity ?? 0)}% Humidity
                    </p>
                    <p>
                      {x.data.next_1_hours?.summary?.symbol_code ?? null}
                    </p>
                  </div>
                </li>
              );
            })}
          </ForecastContainer>
        </section>
      </main>
    </div>
  );
}