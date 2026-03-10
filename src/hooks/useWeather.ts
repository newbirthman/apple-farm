'use client';

import { useState, useEffect } from 'react';

export interface WeatherData {
    temp: number;
    weatherCode: number;
    pm10: number | null;
    pm25: number | null;
    locationName: string;
}

export function useWeather() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            // 1. 역지오코딩 (위도/경도로 지역명 찾기) - 비로그인 환경에서 사용할 수 있는 무료 서비스나 고정 위치 추천
            // 여기서는 Open-Meteo 사용 시 좌표만으로도 가능하지만, 위치명을 위해 간단히 처리
            const locationName = '내 농장';

            // 2. Open-Meteo API 호출 (날씨 + 미세먼지)
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
            const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5`;

            const [weatherRes, airRes] = await Promise.all([
                fetch(weatherUrl),
                fetch(airUrl)
            ]);

            const weatherData = await weatherRes.json();
            const airData = await airRes.json();

            setWeather({
                temp: Math.round(weatherData.current.temperature_2m),
                weatherCode: weatherData.current.weather_code,
                pm10: airData.current.pm10,
                pm25: airData.current.pm2_5,
                locationName: locationName
            });
        } catch (err) {
            console.error('기상 데이터 로드 실패:', err);
            setError('데이터를 불러올 수 없습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('브라우저가 위치 정보를 지원하지 않습니다.');
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                fetchWeather(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                console.warn('위치 정보를 가져올 수 없습니다. 기본 위치(창원)를 사용합니다.');
                fetchWeather(35.2285, 128.6811); // 사용자 거주지 예상 좌표 (창원 일대)
            }
        );
    }, []);

    return { weather, isLoading, error };
}
