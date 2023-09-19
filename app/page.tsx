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

function getWeeklyForecast(timeseries: MetNoData["properties"]["timeseries"]) {
  const highLows = new Map();
  const seenDates = new Set();

  return timeseries
    // remove today's entry any anything older
    .filter((entry) => new Date(entry.time).getDate() > new Date().getDate())
    // // remove any entries further than 7 days out
    // .filter((entry) => new Date(entry.time).getTime() <= new Date(entry.time).getTime() + (7 * 24 * 60 * 60 * 1000))
    // calculate highs & lows
    .map((entry) => {
      const date = new Date(entry.time).getDate();

      if (highLows.has(date)) return entry;

      highLows.set(date, getHighLowOnDate(timeseries, date));

      return entry;
    })
    // reduce to 1 entry per day
    .filter((entry) => {
      const date = new Date(entry.time).getDate();

      if (seenDates.has(date)) return false;

      seenDates.add(date);

      return true;
    })
    // add highs and lows to entries
    .map((entry) => {
      return Object.assign(entry, {
        highLow: highLows.get(new Date(entry.time).getDate()) as readonly [number, number]
      });
    })
    // truncate to 7 days
    .slice(0, 7);
}

function getHighLowOnDate(timeseries: MetNoData["properties"]["timeseries"], date: number) {
  const entries = timeseries.filter((entry) => new Date(entry.time).getDate() === date);
  const temps = entries.map((entry) => entry.data.instant.details?.air_temperature ?? 0);
  const low = Math.min(...temps);
  const high = Math.max(...temps);
  return [low, high] as const;
}

export default async function Page({ searchParams: { lat, lon } }: { searchParams: { lat: string, lon: string }}) {
  if (!lat || !lon) redirect("/location/select");

  const data = await (await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`, { headers: { "user-agent": "cylex Weather - https://weather.cylex.dog - cylex@cylex.dog" } })).json() as MetNoData | undefined | null;

  const current = data?.properties.timeseries.find((entry) => new Date(entry.time).getHours() === new Date().getHours());

  const currentHighLow = getHighLowOnDate(data?.properties.timeseries ?? [], new Date().getDate());
  const weeklyForecast = getWeeklyForecast(data?.properties.timeseries ?? []);

  return (
    <main className="relative flex flex-col">
      <div aria-hidden="true" className="bg-gradient-to-b from-[#3F7AB0] to-[#16293C] fixed inset-0 -z-10" />
      <section aria-label="current weather">
        <div aria-hidden="true" className="text-[15px] flex items-center gap-2 pt-4 px-4 lg:pt-20 lg:px-20 mb-4 text-white">
          <img src="/location.svg" />
          <span className="opacity-75">
            {lat}, {lon}
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-6 md:gap-0 md:justify-between p-4 lg:p-20 pt-0 lg:pt-0">
          <div className="text-5xl font-bold text-white flex items-center gap-4 md:gap-9">
            <img aria-hidden="true" src="/cloud.svg" />
            <h1>
              {data && cToF(data.properties.timeseries[0].data.instant.details?.air_temperature ?? 0)}°
            </h1>
          </div>
          <ul className="flex items-center flex-wrap gap-[5px] w-full md:w-auto">
            <li className="bg-white/10 rounded-[5px] text-white p-5 w-full md:w-48">
              <h1 className="font-semibold opacity-75 text-[10px] text-xs">
                Low / High
              </h1>
              <p className="font-bold text-2xl">
                {cToF(currentHighLow[0])}° / {cToF(currentHighLow[1])}°
              </p>
            </li>
            <li className="bg-white/10 rounded-[5px] text-white p-5 w-full md:w-48">
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
      <section aria-label="forecasts" className="p-4 lg:p-20 !pt-0 grid">
        <h1 className="text-[15px] font-semibold text-white opacity-75 mb-1">
          Today&apos;s Forecast
        </h1>
        <ForecastContainer currentIdx={data?.properties.timeseries.indexOf(current!) ?? 0}>
          {data?.properties.timeseries.filter((entry) => {
            const entryDate = new Date(entry.time);
            const currentDate = new Date();

            return entryDate.getDate() === currentDate.getDate();
          }).map((x) => {
            const date = new Date(x.time);
            return (
              <li key={x.time} className="bg-white/10 rounded-[5px] h-80a min-w-[280px] max-w-[280px] p-8 text-white">
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
        <h1 className="text-[15px] font-semibold text-white opacity-75 mb-1 mt-4">
          Weekly Forecast
        </h1>
        <ForecastContainer currentIdx={0}>
          {weeklyForecast.map((x) => {
            const date = new Date(x.time);
            return (
              <li key={x.time} className="bg-white/10 rounded-[5px] min-w-[280px] max-w-fit p-8 h-min text-white">
                <h1 className="font-semibold mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]}
                </h1>
                <div className="font-bold text-5xl">
                  {/* <img aria-hidden="true" src="/cloud.svg" width={44} /> */}
                  <p className="whitespace-nowrap">
                    {/* {cToF(x.data.instant.details?.air_temperature ?? 0)}° */}
                    {cToF(x.highLow[0])}° - {cToF(x.highLow[1])}°
                  </p>
                </div>
              </li>
            );
          })}
        </ForecastContainer>
      </section>
    </main>
  );
}