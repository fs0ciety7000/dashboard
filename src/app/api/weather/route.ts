import { NextResponse } from "next/server";
import { settings } from "@/config/settings";

export async function GET() {
  try {
    const { latitude, longitude } = settings.weather;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,relative_humidity_2m,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      throw new Error(`Weather API error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      temperature: data.current.temperature_2m,
      apparentTemperature: data.current.apparent_temperature,
      weatherCode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      visibility: data.current.visibility,
      daily: {
        maxTemp: data.daily.temperature_2m_max[0],
        minTemp: data.daily.temperature_2m_min[0],
        weatherCodes: data.daily.weather_code,
        dates: data.daily.time,
      },
    });
  } catch (error) {
    console.error("Weather fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
