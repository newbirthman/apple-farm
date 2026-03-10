'use client';

import { useWeather } from '@/hooks/useWeather';
import { Cloud, Sun, CloudRain, CloudLightning, Wind, MapPin, Loader2 } from 'lucide-react';

const weatherIcons: Record<number, any> = {
    0: Sun, // Sunny
    1: Sun, 2: Cloud, 3: Cloud, // Partly Cloudy
    45: Wind, 48: Wind, // Fog
    51: CloudRain, 53: CloudRain, 55: CloudRain, // Drizzle
    61: CloudRain, 63: CloudRain, 65: CloudRain, // Rain
    71: CloudLightning, 73: CloudLightning, 75: CloudLightning, // Snow
    80: CloudRain, 81: CloudRain, 82: CloudRain, // Showers
    95: CloudLightning, // Thunderstorm
};

const weatherLabels: Record<number, string> = {
    0: '맑음', 1: '대체로 맑음', 2: '구름 조금', 3: '흐림',
    45: '안개', 48: '짙은 안개',
    51: '가벼운 이슬비', 53: '이슬비', 55: '강한 이슬비',
    61: '가벼운 비', 63: '비', 65: '강한 비',
    71: '가벼운 눈', 73: '눈', 75: '강한 눈',
    80: '소나기', 81: '강한 소나기', 82: '격렬한 소나기',
    95: '천둥번개',
};

const getAirQualityLabel = (pm10: number | null) => {
    if (pm10 === null) return { text: '정보없음', color: 'text-gray-400' };
    if (pm10 <= 30) return { text: '좋음 🍏', color: 'text-blue-500' };
    if (pm10 <= 80) return { text: '보통 🌳', color: 'text-green-500' };
    if (pm10 <= 150) return { text: '나쁨 😷', color: 'text-amber-500' };
    return { text: '매우 나쁨 🚨', color: 'text-red-500' };
};

export default function WeatherWidget() {
    const { weather, isLoading, error } = useWeather();

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center min-h-[140px]">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                <p className="text-sm text-gray-500">기상 정보를 불러오지 못했습니다.</p>
            </div>
        );
    }

    const Icon = weatherIcons[weather.weatherCode] || Cloud;
    const airQuality = getAirQualityLabel(weather.pm10);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">{weather.locationName} (경상남도 창원시 일대)</span>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                    실시간 기상 정보
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 border-r border-gray-100 dark:border-gray-700 pr-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                        <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="text-3xl font-black text-gray-900 dark:text-gray-100">
                            {weather.temp}°
                        </div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {weatherLabels[weather.weatherCode] || '흐림'}
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">미세먼지(PM10)</p>
                        <p className={`text-sm font-bold ${airQuality.color}`}>{airQuality.text}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">기분 좋게 일하기</p>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">오늘도 화이팅! 🌱</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
