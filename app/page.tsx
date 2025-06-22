"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { weatherApi, WeatherData, getWeatherIcon, generateAdvice, getWeatherDescription } from "@/lib/weather-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Search,
  Sun,
  Thermometer,
  Droplets,
  Eye,
  Shirt,
  Umbrella,
  Car,
  AlertCircle,
  Loader2,
  Home,
  WashingMachine,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Zap,
  Moon,
  CloudFog,
} from "lucide-react"

export default function WeatherApp() {
  const [location, setLocation] = useState("位置情報を取得中...")
  const [selectedPrefecture, setSelectedPrefecture] = useState("")
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null)
  
  // タイトルアニメーション用の状態
  const [titleAnimationStep, setTitleAnimationStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // タイトルアニメーションの制御
  useEffect(() => {
    // 初期状態を設定
    setTitleAnimationStep(0)
    setIsAnimating(false)
    
    const animationSequence = async () => {
      // 少し待ってからアニメーション開始
      await new Promise(resolve => setTimeout(resolve, 500))
      
      while (true) {
        // ステップ1: "天気予" + アイコン
        setTitleAnimationStep(1)
        setIsAnimating(true)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // ステップ2: "天気予報"
        setTitleAnimationStep(2)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // ステップ3: "天気予" + アイコン
        setTitleAnimationStep(3)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // ステップ4: "天気予防"
        setTitleAnimationStep(4)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // ステップ5: "天気予" + アイコン（最終状態）- 1秒で次のループに移る
        setTitleAnimationStep(5)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    const animationPromise = animationSequence()
    
    // クリーンアップ関数
    return () => {
      // アニメーションを停止
      setTitleAnimationStep(0)
      setIsAnimating(false)
    }
  }, [])

  // 地方のリスト
  const regions = [
    '北海道・東北地方',
    '関東地方',
    '中部地方',
    '近畿地方',
    '中国地方',
    '四国地方',
    '九州・沖縄地方'
  ]

  // 地方別都道府県マッピング
  const regionPrefectureMapping: { [key: string]: string[] } = {
    '北海道・東北地方': ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    '関東地方': ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    '中部地方': ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
    '近畿地方': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    '中国地方': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    '四国地方': ['徳島県', '香川県', '愛媛県', '高知県'],
    '九州・沖縄地方': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
  }

  // すべての都道府県を1つのリストにまとめる
  const allPrefectures = regions.flatMap(region => regionPrefectureMapping[region])

  // 47都道府県の座標範囲マッピング
  const prefectureCoordinates: { [key: string]: { lat: [number, number], lon: [number, number] } } = {
    '北海道': { lat: [41.4, 45.6], lon: [139.3, 145.8] },
    '青森県': { lat: [40.2, 41.6], lon: [139.9, 141.9] },
    '岩手県': { lat: [38.9, 40.5], lon: [140.7, 142.1] },
    '宮城県': { lat: [37.8, 39.2], lon: [140.3, 141.8] },
    '秋田県': { lat: [38.9, 40.3], lon: [139.5, 141.1] },
    '山形県': { lat: [37.8, 39.2], lon: [139.4, 140.8] },
    '福島県': { lat: [36.9, 38.2], lon: [139.2, 141.0] },
    '茨城県': { lat: [35.7, 36.9], lon: [139.4, 140.9] },
    '栃木県': { lat: [36.2, 37.2], lon: [139.1, 140.2] },
    '群馬県': { lat: [35.9, 37.1], lon: [138.4, 139.8] },
    '埼玉県': { lat: [35.5, 36.4], lon: [138.7, 140.0] },
    '千葉県': { lat: [34.9, 36.0], lon: [139.7, 141.0] },
    '東京都': { lat: [35.5, 36.2], lon: [139.0, 140.2] },
    '神奈川県': { lat: [35.1, 35.8], lon: [138.9, 139.9] },
    '新潟県': { lat: [36.7, 38.2], lon: [137.6, 139.5] },
    '富山県': { lat: [36.2, 37.0], lon: [136.8, 137.9] },
    '石川県': { lat: [36.4, 37.5], lon: [136.2, 137.5] },
    '福井県': { lat: [35.4, 36.2], lon: [135.5, 136.8] },
    '山梨県': { lat: [35.1, 36.0], lon: [138.0, 139.2] },
    '長野県': { lat: [35.2, 37.1], lon: [137.2, 139.1] },
    '岐阜県': { lat: [35.1, 36.8], lon: [136.0, 137.8] },
    '静岡県': { lat: [34.2, 35.7], lon: [137.5, 139.1] },
    '愛知県': { lat: [34.4, 35.4], lon: [136.4, 137.8] },
    '三重県': { lat: [33.7, 35.2], lon: [135.8, 136.9] },
    '滋賀県': { lat: [34.8, 35.7], lon: [135.7, 136.5] },
    '京都府': { lat: [34.8, 35.8], lon: [135.0, 136.0] },
    '大阪府': { lat: [34.2, 35.0], lon: [135.0, 135.8] },
    '兵庫県': { lat: [34.2, 35.7], lon: [134.2, 135.5] },
    '奈良県': { lat: [33.8, 34.8], lon: [135.4, 136.2] },
    '和歌山県': { lat: [33.4, 34.5], lon: [135.0, 136.0] },
    '鳥取県': { lat: [35.0, 35.7], lon: [133.2, 134.5] },
    '島根県': { lat: [34.4, 35.6], lon: [131.8, 133.5] },
    '岡山県': { lat: [34.4, 35.3], lon: [133.0, 134.5] },
    '広島県': { lat: [34.0, 35.0], lon: [131.8, 133.5] },
    '山口県': { lat: [33.8, 34.8], lon: [130.8, 132.2] },
    '徳島県': { lat: [33.5, 34.3], lon: [133.5, 134.8] },
    '香川県': { lat: [34.0, 34.5], lon: [133.5, 134.5] },
    '愛媛県': { lat: [32.9, 34.3], lon: [132.2, 133.8] },
    '高知県': { lat: [32.7, 34.0], lon: [132.5, 134.2] },
    '福岡県': { lat: [33.0, 34.2], lon: [130.0, 131.5] },
    '佐賀県': { lat: [32.9, 33.8], lon: [129.8, 130.5] },
    '長崎県': { lat: [32.2, 34.7], lon: [128.2, 130.2] },
    '熊本県': { lat: [32.0, 33.5], lon: [130.0, 131.8] },
    '大分県': { lat: [32.5, 33.8], lon: [130.8, 132.2] },
    '宮崎県': { lat: [31.2, 33.0], lon: [130.5, 132.0] },
    '鹿児島県': { lat: [27.0, 32.0], lon: [128.5, 131.2] },
    '沖縄県': { lat: [24.0, 28.5], lon: [122.9, 131.3] }
  }

  // 座標から都道府県を推定する関数
  const estimatePrefectureFromCoordinates = (lat: number, lon: number): string => {
    for (const [prefecture, coords] of Object.entries(prefectureCoordinates)) {
      const [minLat, maxLat] = coords.lat
      const [minLon, maxLon] = coords.lon
      
      if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
        return prefecture
      }
    }
    
    // 範囲外の場合は最も近い都道府県を返す（簡易版）
    return "東京都" // デフォルト
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours())
    }, 60000) // 1分ごとに更新

    return () => clearInterval(timer)
  }, [])

  // アプリケーション起動時に現在地を取得、許可されていない場合は東京を表示
  useEffect(() => {
    console.log('🔍 useEffect triggered - Initial weather loading');
    console.log('Current state:', { weatherData: !!weatherData, loading, location });
    
    const loadInitialWeather = async () => {
      console.log('🚀 Starting initial weather load...');
      setLocation("検索中...")
      
      try {
        // 現在地の取得を試行
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'))
            return
          }
          
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          })
        })
        
        const { latitude, longitude } = position.coords
        console.log('📍 Current location obtained:', { latitude, longitude })
        
        setCoordinates({ lat: latitude, lon: longitude })
        
        // 座標から都道府県を推定
        const estimatedPrefecture = estimatePrefectureFromCoordinates(latitude, longitude)
        console.log('🗺️ Estimated prefecture:', estimatedPrefecture);
        setSelectedPrefecture(estimatedPrefecture)
        
        // 検索ロジックを使用して日本語表記を統一
        try {
          const result = await weatherApi.searchLocation(estimatedPrefecture)
          if (result) {
            console.log('✅ Location search result:', result)
            setLocation(result.name)
            await fetchWeatherData(result.lat, result.lon)
          } else {
            console.log('⚠️ No search result, using coordinates directly')
            const addressResult = await weatherApi.getAddress(latitude, longitude)
            setLocation(addressResult)
            await fetchWeatherData(latitude, longitude)
          }
        } catch (error) {
          console.error('❌ Error searching location:', error)
          const addressResult = await weatherApi.getAddress(latitude, longitude)
          setLocation(addressResult)
          await fetchWeatherData(latitude, longitude)
        }
        
      } catch (error) {
        console.log('🌍 Geolocation not permitted or failed, using Tokyo as default:', error)
        
        // 現在地の取得に失敗した場合は東京を表示
        setLocation("検索中...")
        setCoordinates({ lat: 35.6895, lon: 139.6917 })
        setSelectedPrefecture("東京都")
        
        try {
          const result = await weatherApi.searchLocation("東京都")
          if (result) {
            console.log('✅ Default location search result:', result)
            setLocation(result.name)
            await fetchWeatherData(result.lat, result.lon)
          } else {
            console.log('⚠️ No search result, using default coordinates')
            setLocation("東京都")
            await fetchWeatherData(35.6895, 139.6917)
          }
        } catch (error) {
          console.error('❌ Error loading default weather:', error)
          setLocation("東京都")
          await fetchWeatherData(35.6895, 139.6917)
        }
      }
    }

    // 初回のみ実行
    if (!weatherData && !loading) {
      console.log('🎯 Executing initial weather load...');
      loadInitialWeather()
    } else {
      console.log('⏭️ Skipping initial load - already has data or loading');
    }
  }, []) // 空の依存配列に変更

  // 天気データを取得する関数
  const fetchWeatherData = async (lat: number, lon: number) => {
    console.log('🌤️ fetchWeatherData called with coordinates:', { lat, lon });
    setLoading(true)
    setError(null)
    
    try {
      console.log('📡 Fetching weather data for coordinates:', { lat, lon })
      const data = await weatherApi.getWeatherData(lat, lon)
      console.log('✅ Weather data received successfully:', data)
      setWeatherData(data)
      console.log('💾 Weather data set to state');
    } catch (err: any) {
      console.error('❌ Error fetching weather data:', err)
      const errorMessage = err.message || '天気データの取得に失敗しました。'
      setError(`${errorMessage} しばらく時間をおいて再度お試しください。`)
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false)
    }
  }

  // 現在の都道府県を取得する関数
  const getCurrentLocation = () => {
    setLoading(true)
    setError(null)
    setLocation("位置情報を取得中...")

    if (!navigator.geolocation) {
      setError('お使いのブラウザは位置情報をサポートしていません。')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        console.log('Current location obtained:', { latitude, longitude })
        setCoordinates({ lat: latitude, lon: longitude })
        
        // 住所を取得してから都道府県を特定
        try {
          const address = await weatherApi.getAddress(latitude, longitude)
          console.log('Address from reverse geocoding:', address)
          setLocation("検索中...")
          
          // 住所から都道府県名を抽出
          const prefectureMatch = address.match(/(東京都|北海道|[^\s]+県|[^\s]+府)/)
          if (prefectureMatch) {
            const prefecture = prefectureMatch[1]
            console.log('Extracted prefecture:', prefecture)
            
            // 都道府県選択UIを自動設定
            setSelectedPrefecture(prefecture)
            
            // 検索ロジックを使用して県庁所在地で検索
            const result = await weatherApi.searchLocation(prefecture)
            if (result) {
              console.log('Search result for prefecture:', result)
              setLocation(result.name)
              await fetchWeatherData(result.lat, result.lon)
            } else {
              console.log('No search result for prefecture, using coordinates')
              setLocation(prefecture)
              await fetchWeatherData(latitude, longitude)
            }
          } else {
            console.log('Could not extract prefecture from address, using coordinate estimation')
            // 47都道府県対応の座標推定を使用
            const estimatedPrefecture = estimatePrefectureFromCoordinates(latitude, longitude)
            console.log('Estimated prefecture from coordinates:', estimatedPrefecture)
            setSelectedPrefecture(estimatedPrefecture)
            
            // 推定した都道府県で検索
            const result = await weatherApi.searchLocation(estimatedPrefecture)
            if (result) {
              console.log('Search result for estimated prefecture:', result)
              setLocation(result.name)
              await fetchWeatherData(result.lat, result.lon)
            } else {
              console.log('No search result for estimated prefecture, using coordinates')
              setLocation(estimatedPrefecture)
              await fetchWeatherData(latitude, longitude)
            }
          }
        } catch (error) {
          console.error('Error getting address:', error)
          // エラーの場合も47都道府県対応推定を使用
          const estimatedPrefecture = estimatePrefectureFromCoordinates(latitude, longitude)
          console.log('Estimated prefecture due to error:', estimatedPrefecture)
          setSelectedPrefecture(estimatedPrefecture)
          setLocation(estimatedPrefecture)
          await fetchWeatherData(latitude, longitude)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = '位置情報の取得に失敗しました。'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '位置情報の使用が許可されていません。'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置情報が利用できません。'
            break
          case error.TIMEOUT:
            errorMessage = '位置情報の取得がタイムアウトしました。'
            break
        }
        
        setError(errorMessage)
        setLoading(false)
      }
    )
  }

  // 都道府県選択時の処理
  const handlePrefectureSelect = (prefecture: string) => {
    setSelectedPrefecture(prefecture)
    
    // 検索実行（県庁所在地で検索）
    handleSearch(prefecture)
  }

  // 検索実行
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    setLocation("検索中...")
    
    try {
      console.log('Searching for:', searchQuery)
      const result = await weatherApi.searchLocation(searchQuery)
      
      if (result) {
        console.log('Search result:', result)
        setLocation(result.name)
        await fetchWeatherData(result.lat, result.lon)
      } else {
        setError('指定された場所が見つかりませんでした。')
        setLocation("東京都新宿区")
      }
    } catch (err: any) {
      console.error('Search error:', err)
      setError('検索中にエラーが発生しました。')
      setLocation("東京都新宿区")
    } finally {
      setLoading(false)
    }
  }

  // 天気に応じた背景色を取得
  const getWeatherBackground = () => {
    const currentWeather = getCurrentWeather()
    if (!currentWeather) return "bg-gradient-to-br from-blue-50 via-white to-blue-50"

    switch (currentWeather.icon) {
      case "sunny":
        return "bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-100"
      case "cloudy":
        return "bg-gradient-to-br from-gray-50 via-slate-100 to-gray-200"
      case "rainy":
        return "bg-gradient-to-br from-blue-50 via-slate-100 to-blue-200"
      case "snowy":
        return "bg-gradient-to-br from-blue-100 via-slate-200 to-blue-300"
      case "windy":
        return "bg-gradient-to-br from-gray-100 via-slate-200 to-gray-300"
      case "thunderstorm":
        return "bg-gradient-to-br from-purple-50 via-slate-200 to-purple-200"
      case "clear-night":
        return "bg-gradient-to-br from-blue-900 via-slate-800 to-blue-800"
      case "foggy":
        return "bg-gradient-to-br from-gray-200 via-slate-300 to-gray-400"
      default:
        return "bg-gradient-to-br from-blue-50 via-white to-blue-50"
    }
  }

  // 現在の天気データを取得
  const getCurrentWeather = () => {
    if (!weatherData) return null

    const current = weatherData.current
    const weather = current.weather[0]
    
    // 統一された天気条件判定を使用
    const iconType = getWeatherCondition(current)
    
    const japaneseDescription = getWeatherDescription(weather.id, weather.description)
    
    // ローカル時間で現在の日付を取得
    const now = new Date()
    const currentHour = now.getHours()
    
    // getHourlyForecastと同じロジックで今日のデータを取得
    const todayHourlyData = []
    
    // 今日の0時から23時までのデータを生成
    for (let hour = 0; hour < 24; hour++) {
      const targetTime = new Date(now)
      targetTime.setHours(hour, 0, 0, 0)
      
      // APIデータから該当する時間のデータを探す
      let hourData = null
      let minTimeDiff = Infinity
      
      for (const h of weatherData.hourly) {
        const hourTime = new Date(h.dt * 1000)
        const timeDiff = Math.abs(hourTime.getTime() - targetTime.getTime())
        
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff
          hourData = h
        }
      }
      
      if (hourData) {
        todayHourlyData.push(hourData)
      }
    }
    
    console.log('Today hourly data count:', todayHourlyData.length)
    console.log('Today hourly temps:', todayHourlyData.map((h: any) => `${new Date(h.dt * 1000).getHours()}:00 - ${h.temp}°C`))
    
    let todayMaxTemp = current.temp
    let todayMinTemp = current.temp
    
    if (todayHourlyData.length > 0) {
      const temps = todayHourlyData.map((hour: any) => hour.temp)
      todayMaxTemp = Math.max(...temps)
      todayMinTemp = Math.min(...temps)
      console.log('Calculated today max/min:', { max: todayMaxTemp, min: todayMinTemp })
    } else {
      console.log('No hourly data for today, using current temp')
    }
    
    return {
      location: location,
      date: now.toLocaleDateString('ja-JP', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      }),
      condition: japaneseDescription,
      description: `${japaneseDescription}。気温は${Math.round(current.temp)}°Cです。`,
      temperature: Math.round(current.temp),
      maxTemp: Math.round(todayMaxTemp),
      minTemp: Math.round(todayMinTemp),
      humidity: current.humidity,
      windSpeed: Math.round(current.wind_speed * 3.6), // m/s to km/h
      feelsLike: Math.round(current.feels_like),
      icon: iconType,
    }
  }

  // 1時間ごとの予報データを取得
  const getHourlyForecast = () => {
    if (!weatherData) return []

    // 現在時刻を取得（ローカル時間）
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    console.log('Current time (local):', `${currentHour}:${currentMinute}`, 'Total hourly data:', weatherData.hourly.length)
    
    // 現在時刻から24時間分のデータを生成
    const hourlyForecast = []
    
    // 現在時刻から開始して24時間分
    for (let i = 0; i < 24; i++) {
      const targetTime = new Date(now)
      targetTime.setHours(currentHour + i, 0, 0, 0)
      
      // APIデータから該当する時間のデータを探す
      let hourData = null
      let minTimeDiff = Infinity
      
      for (const hour of weatherData.hourly) {
        const hourTime = new Date(hour.dt * 1000)
        const timeDiff = Math.abs(hourTime.getTime() - targetTime.getTime())
        
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff
          hourData = hour
        }
      }
      
      if (hourData) {
        const weather = hourData.weather[0]
        
        // 降水確率を0-100の範囲に制限
        const precipitation = Math.max(0, Math.min(100, Math.round(hourData.pop * 100)))
        
        // 統一された天気条件判定を使用
        const iconType = getWeatherCondition(hourData)
        
        // 時間を表示（分は00で統一）
        const displayHour = targetTime.getHours()
        const displayTime = `${displayHour.toString().padStart(2, '0')}:00`

        hourlyForecast.push({
          time: displayTime,
          temp: Math.round(hourData.temp),
          precipitation,
          icon: iconType,
          description: getWeatherDescription(weather.id, weather.description)
        })
      }
    }
    
    console.log('Generated hourly forecast:', hourlyForecast.map(h => `${h.time} (${h.temp}°C)`))
    return hourlyForecast
  }

  // 週間予報データを取得
  const getWeeklyForecast = () => {
    if (!weatherData) return []

    return weatherData.daily.slice(0, 7).map((day, index) => {
      const weather = day.weather[0]
      
      // 統一された天気条件判定を使用
      const iconType = getWeatherCondition(day)
      
      // 実際の日付から曜日を取得
      const date = new Date(day.dt * 1000)
      
      let dayLabel = ''
      if (index === 0) {
        dayLabel = '今日'
      } else if (index === 1) {
        dayLabel = '明日'
      } else {
        // 曜日を日本語で取得
        const weekdays = ['日', '月', '火', '水', '木', '金', '土']
        dayLabel = weekdays[date.getDay()]
      }
      
      return {
        day: dayLabel,
        maxTemp: Math.round(day.temp.max),
        minTemp: Math.round(day.temp.min),
        icon: iconType,
        description: getWeatherDescription(weather.id, weather.description)
      }
    })
  }

  // アドバイスデータを取得
  const getAdvice = () => {
    if (!weatherData) {
      return {
        clothing: "天気データを読み込み中...",
        items: "天気データを読み込み中...",
        transportation: "天気データを読み込み中...",
        laundry: "天気データを読み込み中...",
      }
    }

    return generateAdvice(weatherData)
  }

  // 統一された天気条件判定関数
  const getWeatherCondition = (weatherData: any) => {
    if (!weatherData) return 'sunny'
    
    const main = weatherData.weather[0].main.toLowerCase()
    const description = weatherData.weather[0].description.toLowerCase()
    
    if (main.includes('cloud') || description.includes('曇')) {
      return 'cloudy'
    } else if (main.includes('rain') || description.includes('雨')) {
      return 'rainy'
    } else if (main.includes('snow') || description.includes('雪')) {
      return 'snowy'
    } else if (main.includes('thunder') || description.includes('雷')) {
      return 'thunder'
    } else if (main.includes('clear') || description.includes('晴')) {
      return 'sunny'
    } else if (main.includes('mist') || description.includes('霧')) {
      return 'misty'
    } else {
      return 'sunny'
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return "sunny"
      case "cloudy":
        return "cloudy"
      case "rainy":
        return "rainy"
      case "snowy":
        return "snowy"
      case "thunder":
        return "thunder"
      case "misty":
        return "misty"
      case "windy":
        return "windy"
      default:
        return "sunny"
    }
  }

  const getWeatherIconComponent = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-8 h-8 text-yellow-500" />
      case "cloudy":
        return <Cloud className="w-8 h-8 text-gray-500" />
      case "rainy":
        return <CloudRain className="w-8 h-8 text-blue-500" />
      case "snowy":
        return <CloudSnow className="w-8 h-8 text-blue-200" />
      case "thunder":
        return <Zap className="w-8 h-8 text-purple-500" />
      case "misty":
        return <CloudFog className="w-8 h-8 text-gray-400" />
      case "windy":
        return <Wind className="w-8 h-8 text-gray-600" />
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />
    }
  }

  const getSmallWeatherIconComponent = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-5 h-5 text-yellow-500" />
      case "cloudy":
        return <Cloud className="w-5 h-5 text-gray-500" />
      case "rainy":
        return <CloudRain className="w-5 h-5 text-blue-500" />
      case "snowy":
        return <CloudSnow className="w-5 h-5 text-blue-200" />
      case "thunder":
        return <Zap className="w-5 h-5 text-purple-500" />
      case "misty":
        return <CloudFog className="w-5 h-5 text-gray-400" />
      case "windy":
        return <Wind className="w-5 h-5 text-gray-600" />
      default:
        return <Sun className="w-5 h-5 text-yellow-500" />
    }
  }

  const getWeatherCardBackground = () => {
    const currentWeather = getCurrentWeather()
    if (!currentWeather) return "backdrop-blur-sm bg-white/80 border-0 shadow-lg"

    const baseStyle = "backdrop-blur-sm bg-white/80 border-0 shadow-lg"
    switch (currentWeather.icon) {
      case "sunny":
        return `${baseStyle} shadow-yellow-200/50 ring-2 ring-yellow-200/30`
      case "rainy":
        return `${baseStyle} shadow-blue-200/50 ring-2 ring-blue-200/30`
      case "cloudy":
        return `${baseStyle} shadow-gray-200/50 ring-2 ring-gray-200/30`
      default:
        return baseStyle
    }
  }

  const renderTitle = () => {
    switch (titleAnimationStep) {
      case 0:
        return (
          <h1 className="text-3xl md:text-4xl text-gray-800 tracking-wide ultra-thin-title flex items-center justify-center font-light title-transition w-full">
            <div className="flex items-center justify-center min-w-[200px] md:min-w-[240px]">
              <span style={{ letterSpacing: "0.3em" }} className="title-text-transition">天気予</span>
              <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 ml-0 title-icon-transition">
                {getCurrentWeatherIcon()}
              </span>
            </div>
          </h1>
        )
      case 1:
        return (
          <h1 className="text-3xl md:text-4xl text-gray-800 tracking-wide ultra-thin-title flex items-center justify-center font-light title-char-fade-in title-transition w-full">
            <div className="flex items-center justify-center min-w-[200px] md:min-w-[240px]">
              <span style={{ letterSpacing: "0.3em" }} className="title-text-transition">天気予</span>
              <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 ml-0 title-icon-transition">
                {getCurrentWeatherIcon()}
              </span>
            </div>
          </h1>
        )
      case 2:
        return (
          <h1 className="text-3xl md:text-4xl text-gray-800 tracking-wide ultra-thin-title flex items-center justify-center font-light title-char-fade-in title-transition w-full">
            <div className="flex items-center justify-center min-w-[200px] md:min-w-[240px]">
              <span style={{ letterSpacing: "0.3em" }} className="title-text-transition">天気予</span>
              <span key={`char-${titleAnimationStep}`} className={`inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 ml-0 ${isAnimating ? 'title-char-fade-in' : ''} title-icon-transition`}>報</span>
            </div>
          </h1>
        )
      case 3:
        return (
          <h1 className="text-3xl md:text-4xl text-gray-800 tracking-wide ultra-thin-title flex items-center justify-center font-light title-char-fade-in title-transition w-full">
            <div className="flex items-center justify-center min-w-[200px] md:min-w-[240px]">
              <span style={{ letterSpacing: "0.3em" }} className="title-text-transition">天気予</span>
              <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 ml-0 title-icon-transition">
                {getCurrentWeatherIcon()}
              </span>
            </div>
          </h1>
        )
      case 4:
        return (
          <h1 className="text-3xl md:text-4xl text-gray-800 tracking-wide ultra-thin-title flex items-center justify-center font-light title-char-fade-in title-transition w-full">
            <div className="flex items-center justify-center min-w-[200px] md:min-w-[240px]">
              <span style={{ letterSpacing: "0.3em" }} className="title-text-transition">天気予</span>
              <span key={`char-${titleAnimationStep}`} className={`inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 ml-0 ${isAnimating ? 'title-char-fade-in' : ''} title-icon-transition`}>防</span>
            </div>
          </h1>
        )
      case 5:
      default:
        return (
          <h1 className="text-3xl md:text-4xl text-gray-800 tracking-wide ultra-thin-title flex items-center justify-center font-light title-char-fade-in title-transition w-full">
            <div className="flex items-center justify-center min-w-[200px] md:min-w-[240px]">
              <span style={{ letterSpacing: "0.3em" }} className="title-text-transition">天気予</span>
              <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 ml-0 title-icon-transition">
                {getCurrentWeatherIcon()}
              </span>
            </div>
          </h1>
        )
    }
  }

  // 今日の天気に応じたアイコンを取得
  const getCurrentWeatherIcon = () => {
    if (!weatherData) {
      return <Sun className="w-7 h-7 md:w-9 md:h-9 text-yellow-500 title-icon-fade-in animate-pulse" />
    }
    
    const iconType = getWeatherCondition(weatherData.current)
    
    switch (iconType) {
      case "sunny":
        return <Sun className="w-7 h-7 md:w-9 md:h-9 text-yellow-500 title-icon-fade-in animate-pulse" />
      case "cloudy":
        return <Cloud className="w-7 h-7 md:w-9 md:h-9 text-gray-500 title-icon-fade-in animate-pulse" />
      case "rainy":
        return <CloudRain className="w-7 h-7 md:w-9 md:h-9 text-blue-500 title-icon-fade-in animate-pulse" />
      case "snowy":
        return <CloudSnow className="w-7 h-7 md:w-9 md:h-9 text-blue-200 title-icon-fade-in animate-pulse" />
      case "thunder":
        return <Zap className="w-7 h-7 md:w-9 md:h-9 text-purple-500 title-icon-fade-in animate-pulse" />
      case "misty":
        return <CloudFog className="w-7 h-7 md:w-9 md:h-9 text-gray-400 title-icon-fade-in animate-pulse" />
      default:
        return <Sun className="w-7 h-7 md:w-9 md:h-9 text-yellow-500 title-icon-fade-in animate-pulse" />
    }
  }

  const currentWeather = getCurrentWeather()
  const hourlyForecast = getHourlyForecast()
  const weeklyForecast = getWeeklyForecast()
  const advice = getAdvice()

  return (
    <div className={`min-h-screen ${getWeatherBackground()}`}>
      <div className="relative z-10 max-w-4xl mx-auto p-4 space-y-6">
        {/* エラーメッセージ */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {error === "位置情報の使用が許可されていません。" && (
                <div className="mt-2 text-xs text-gray-600">
                  もう一度位置情報を取得するにはページをリロードしてください。
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* ヘッダー */}
        <header className="text-center space-y-4">
          {/* 天気データが取得されるまでタイトルを非表示 */}
          {weatherData && renderTitle()}
          
          {/* 現在の都道府県取得ボタン */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={getCurrentLocation} 
              disabled={loading}
              className={`flex items-center gap-2 font-light transition-all duration-200 ${
                loading 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-50 hover:border-blue-300 hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-blue-600">位置情報を取得中...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 animate-bounce text-red-500" />
                  <span>現在の都道府県を取得</span>
                </>
              )}
            </Button>
          </div>

          {/* 読み込み中の表示 */}
          {loading && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>天気データを読み込み中...</span>
              </div>
              <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          {/* 単一選択式検索UI */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">都道府県を選択</label>
              <Select onValueChange={handlePrefectureSelect} value={selectedPrefecture}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="都道府県を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {allPrefectures.map((prefecture) => (
                    <SelectItem key={prefecture} value={prefecture}>
                      {prefecture}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* 今日の天気カード */}
        {currentWeather && (
          <Card className={getWeatherCardBackground()}>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-light text-gray-800">{currentWeather.location}</CardTitle>
              <CardDescription className="text-sm font-light">{currentWeather.date}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center">{getWeatherIconComponent(currentWeather.icon)}</div>
                <h3 className="text-lg font-light text-gray-700">{currentWeather.condition}</h3>
                <p className="text-sm text-gray-600 font-light max-w-md mx-auto">{currentWeather.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-gray-500 font-light">気温</span>
                  </div>
                  <div className="text-lg font-light">{currentWeather.temperature}°C</div>
                  <div className="text-xs text-gray-500 font-light">
                    <span className="text-orange-500">{currentWeather.maxTemp}°</span> / <span className="text-cyan-500">{currentWeather.minTemp}°</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-gray-500 font-light">湿度</span>
                  </div>
                  <div className="text-lg font-light">{currentWeather.humidity}%</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Sun className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500 font-light">風速</span>
                  </div>
                  <div className="text-lg font-light">{currentWeather.windSpeed}km/h</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-gray-500 font-light">体感</span>
                  </div>
                  <div className="text-lg font-light">{currentWeather.feelsLike}°C</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 今日のアドバイスカード - スタイリッシュアニメーション */}
        <Card className="advice-card border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="advice-title text-xl font-light text-gray-800">今日の天気予防</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shirt className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0 animate-pulse-green" />
                <div>
                  <h4 className="advice-title text-sm font-medium text-green-600 mb-1 animate-pulse-green">服装</h4>
                  <p className="text-base text-gray-700 font-medium">{advice.clothing}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Umbrella className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0 animate-pulse-blue" />
                <div>
                  <h4 className="advice-title text-sm font-medium text-blue-600 mb-1 animate-pulse-blue">持ち物</h4>
                  <p className="text-base text-gray-700 font-medium">{advice.items}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0 animate-pulse-orange" />
                <div>
                  <h4 className="advice-title text-sm font-medium text-orange-600 mb-1 animate-pulse-orange">
                    交通手段
                  </h4>
                  <p className="text-base text-gray-700 font-medium">{advice.transportation}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <WashingMachine className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0 animate-pulse-pink" />
                <div>
                  <h4 className="advice-title text-sm font-medium text-pink-600 mb-1 animate-pulse-pink">洗濯物</h4>
                  <p className="text-base text-gray-700 font-medium">{advice.laundry}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 時間帯別天気予報 */}
        {hourlyForecast.length > 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-light text-gray-800">時間別予報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="flex gap-3 pb-2 min-w-max">
                  {hourlyForecast.map((hour, index) => (
                    <div key={index} className="hourly-item flex-shrink-0 text-center space-y-2 min-w-[70px]">
                      <div className="text-xs font-light text-gray-600">{hour.time}</div>
                      <div className="flex justify-center">
                        <div className="w-6 h-6 flex items-center justify-center">
                          {getSmallWeatherIconComponent(hour.icon)}
                        </div>
                      </div>
                      <div className="text-sm font-light">{hour.temp}°C</div>
                      <div className="text-xs text-blue-600 font-light">{hour.precipitation}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 週間予報 */}
        {weeklyForecast.length > 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-light text-gray-800">週間予報</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weeklyForecast.map((day, index) => (
                  <div key={index} className="text-center space-y-2 p-2">
                    <div className="text-xs font-light text-gray-600">{day.day}</div>
                    <div className="flex justify-center">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {getSmallWeatherIconComponent(day.icon)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-light text-orange-500">{day.maxTemp}°</div>
                      <div className="text-xs font-light text-cyan-500">{day.minTemp}°</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* フッター */}
        <footer className="text-center py-6 text-xs text-gray-500 font-light">
          <p>© 2025 天気予防. 天気データ提供: OpenWeatherMap API</p>
        </footer>
      </div>
    </div>
  )
}
