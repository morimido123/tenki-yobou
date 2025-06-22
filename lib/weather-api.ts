const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '82cf4138e1404e92d6a2af6dfbd27857';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// APIキーの確認
console.log('API Key configured:', API_KEY ? 'Yes' : 'No');
console.log('API Key length:', API_KEY?.length || 0);

// 47都道府県の県庁所在地データ
const PREFECTURE_CAPITALS: { [key: string]: { name: string; lat: number; lon: number } } = {
  '北海道': { name: '北海道札幌市', lat: 43.064359, lon: 141.346814 },
  '青森県': { name: '青森県青森市', lat: 40.824308, lon: 140.740315 },
  '岩手県': { name: '岩手県盛岡市', lat: 39.703619, lon: 141.152684 },
  '宮城県': { name: '宮城県仙台市', lat: 38.268839, lon: 140.872103 },
  '秋田県': { name: '秋田県秋田市', lat: 39.7186, lon: 140.102334 },
  '山形県': { name: '山形県山形市', lat: 38.255437, lon: 140.339565 },
  '福島県': { name: '福島県福島市', lat: 37.750299, lon: 140.467521 },
  '茨城県': { name: '茨城県水戸市', lat: 36.341813, lon: 140.446793 },
  '栃木県': { name: '栃木県宇都宮市', lat: 36.565725, lon: 139.883565 },
  '群馬県': { name: '群馬県前橋市', lat: 36.390668, lon: 139.060406 },
  '埼玉県': { name: '埼玉県さいたま市', lat: 35.857428, lon: 139.648933 },
  '千葉県': { name: '千葉県千葉市', lat: 35.607266, lon: 140.106292 },
  '東京都': { name: '東京都新宿区', lat: 35.6895, lon: 139.6917 },
  '神奈川県': { name: '神奈川県横浜市', lat: 35.443708, lon: 139.638026 },
  '新潟県': { name: '新潟県新潟市', lat: 37.902418, lon: 139.023221 },
  '富山県': { name: '富山県富山市', lat: 36.695291, lon: 137.211338 },
  '石川県': { name: '石川県金沢市', lat: 36.594682, lon: 136.625573 },
  '福井県': { name: '福井県福井市', lat: 36.065219, lon: 136.221642 },
  '山梨県': { name: '山梨県甲府市', lat: 35.664158, lon: 138.568449 },
  '長野県': { name: '長野県長野市', lat: 36.651289, lon: 138.181224 },
  '岐阜県': { name: '岐阜県岐阜市', lat: 35.391227, lon: 136.722291 },
  '静岡県': { name: '静岡県静岡市', lat: 34.976944, lon: 138.383054 },
  '愛知県': { name: '愛知県名古屋市', lat: 35.181446, lon: 136.906565 },
  '三重県': { name: '三重県津市', lat: 34.730283, lon: 136.508591 },
  '滋賀県': { name: '滋賀県大津市', lat: 35.004531, lon: 135.86859 },
  '京都府': { name: '京都府京都市', lat: 35.021041, lon: 135.755608 },
  '大阪府': { name: '大阪府大阪市', lat: 34.686316, lon: 135.519711 },
  '兵庫県': { name: '兵庫県神戸市', lat: 34.690079, lon: 135.195511 },
  '奈良県': { name: '奈良県奈良市', lat: 34.685087, lon: 135.805 },
  '和歌山県': { name: '和歌山県和歌山市', lat: 34.226034, lon: 135.167506 },
  '鳥取県': { name: '鳥取県鳥取市', lat: 35.503869, lon: 134.237672 },
  '島根県': { name: '島根県松江市', lat: 35.472295, lon: 133.050499 },
  '岡山県': { name: '岡山県岡山市', lat: 34.661751, lon: 133.934675 },
  '広島県': { name: '広島県広島市', lat: 34.385289, lon: 132.455292 },
  '山口県': { name: '山口県山口市', lat: 34.186121, lon: 131.4705 },
  '徳島県': { name: '徳島県徳島市', lat: 34.065767, lon: 134.559303 },
  '香川県': { name: '香川県高松市', lat: 34.340149, lon: 134.043444 },
  '愛媛県': { name: '愛媛県松山市', lat: 33.84166, lon: 132.765362 },
  '高知県': { name: '高知県高知市', lat: 33.559705, lon: 133.53108 },
  '福岡県': { name: '福岡県福岡市', lat: 33.606389, lon: 130.418064 },
  '佐賀県': { name: '佐賀県佐賀市', lat: 33.249367, lon: 130.298822 },
  '長崎県': { name: '長崎県長崎市', lat: 32.744839, lon: 129.873756 },
  '熊本県': { name: '熊本県熊本市', lat: 32.789828, lon: 130.741667 },
  '大分県': { name: '大分県大分市', lat: 33.238194, lon: 131.612591 },
  '宮崎県': { name: '宮崎県宮崎市', lat: 31.911096, lon: 131.423855 },
  '鹿児島県': { name: '鹿児島県鹿児島市', lat: 31.560148, lon: 130.557981 },
  '沖縄県': { name: '沖縄県那覇市', lat: 26.212401, lon: 127.680932 }
};

export interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  };
  hourly: Array<{
    dt: number;
    temp: number;
    humidity: number;
    wind_speed: number;
    pop: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

export interface GeocodingData {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export const weatherApi = {
  // 緯度経度から天気データを取得（無料版APIを使用）
  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
      // 現在の天気を取得
      const currentUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=ja`;
      console.log('Fetching current weather from:', currentUrl);
      
      const currentResponse = await fetch(currentUrl);
      console.log('Current weather API response status:', currentResponse.status);
      
      if (!currentResponse.ok) {
        const errorText = await currentResponse.text();
        console.error('Current weather API error response:', errorText);
        throw new Error(`Current weather API error: ${currentResponse.status} - ${errorText}`);
      }
      
      const currentData = await currentResponse.json();
      console.log('Current weather data received:', currentData);

      // 5日間の予報を取得（1時間おき）
      const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=ja`;
      console.log('Fetching forecast from:', forecastUrl);
      
      const forecastResponse = await fetch(forecastUrl);
      console.log('Forecast API response status:', forecastResponse.status);
      
      if (!forecastResponse.ok) {
        const errorText = await forecastResponse.text();
        console.error('Forecast API error response:', errorText);
        throw new Error(`Forecast API error: ${forecastResponse.status} - ${errorText}`);
      }
      
      const forecastData = await forecastResponse.json();
      console.log('Forecast data received:', forecastData);

      // データを統合
      const weatherData: WeatherData = {
        current: {
          temp: currentData.main.temp,
          feels_like: currentData.main.feels_like,
          humidity: currentData.main.humidity,
          wind_speed: currentData.wind.speed,
          weather: currentData.weather.map((w: any) => ({
            ...w,
            description: getWeatherDescription(w.id, w.description)
          }))
        },
        hourly: this.interpolateHourlyData(forecastData.list, currentData),
        daily: this.processDailyForecast(forecastData.list)
      };

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },

  // 3時間おきのデータを1時間おきに補間し、現在時刻から開始
  interpolateHourlyData(forecastList: any[], currentData: any): any[] {
    const hourlyData: any[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    console.log('Current time (local):', now.toLocaleString('ja-JP'), 'Current hour:', currentHour);
    console.log('Forecast list length:', forecastList.length);
    
    // 現在の天気データを最初のデータとして追加
    const currentTimestamp = Math.floor(now.getTime() / 1000);
    hourlyData.push({
      dt: currentTimestamp,
      temp: currentData.main.temp,
      humidity: currentData.main.humidity,
      wind_speed: currentData.wind.speed,
      pop: 0, // 現在の降水確率は0として扱う
      weather: currentData.weather.map((w: any) => ({
        ...w,
        description: getWeatherDescription(w.id, w.description)
      }))
    });
    
    // 予報データをそのまま追加（3時間間隔のデータ）
    forecastList.forEach((item: any) => {
      hourlyData.push({
        dt: item.dt,
        temp: item.main.temp,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        pop: item.pop,
        weather: item.weather.map((w: any) => ({
          ...w,
          description: getWeatherDescription(w.id, w.description)
        }))
      });
    });
    
    // 時間順にソート
    hourlyData.sort((a, b) => a.dt - b.dt);
    
    // 重複を除去（同じ時間のデータがある場合）
    const uniqueHourlyData = hourlyData.filter((item, index, array) => {
      if (index === 0) return true;
      return item.dt !== array[index - 1].dt;
    });
    
    console.log('Generated hourly data length:', uniqueHourlyData.length);
    console.log('Hourly data starts from:', new Date(uniqueHourlyData[0].dt * 1000).toLocaleString('ja-JP'));
    
    return uniqueHourlyData;
  },

  // 日次予報を処理
  processDailyForecast(forecastList: any[]): any[] {
    const dailyData: any[] = [];
    const now = new Date();
    
    console.log('Processing daily forecast for', now.toLocaleDateString('ja-JP'));
    console.log('Total forecast items:', forecastList.length);
    
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + i);
      
      // その日のデータを抽出（00:00-23:59、ローカル時間）
      const dayStart = new Date(targetDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(targetDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      console.log(`Day ${i}: ${targetDate.toLocaleDateString('ja-JP')}`);
      console.log(`  Day start (local): ${dayStart.toLocaleString('ja-JP')}`);
      console.log(`  Day end (local): ${dayEnd.toLocaleString('ja-JP')}`);
      
      const dayForecasts = forecastList.filter((item: any) => {
        // タイムスタンプをローカル時間で比較
        const itemDate = new Date(item.dt * 1000);
        
        // より確実な日付比較（ローカル時間で比較）
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.getMonth();
        const itemDay = itemDate.getDate();
        
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();
        const targetDay = targetDate.getDate();
        
        const isInDay = itemYear === targetYear && 
                       itemMonth === targetMonth && 
                       itemDay === targetDay;
        
        if (i === 0) { // 今日のデータのみログ出力
          console.log(`  Item ${itemDate.toLocaleString('ja-JP')} (${itemYear}-${itemMonth+1}-${itemDay}): ${item.main.temp}°C (in day: ${isInDay})`);
        }
        
        return isInDay;
      });
      
      console.log(`  Found ${dayForecasts.length} forecasts for day ${i}`);
      
      if (dayForecasts.length > 0) {
        // その日の気温の最小値と最大値を計算
        const temps = dayForecasts.map((item: any) => item.main.temp);
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        
        console.log(`  Temperature range: ${minTemp}°C - ${maxTemp}°C`);
        
        if (i === 0) { // 今日のデータの詳細ログ
          console.log(`  Today's temperatures:`, temps);
          console.log(`  Min temp: ${minTemp}°C, Max temp: ${maxTemp}°C`);
        }
        
        // その日の12:00のデータを基準にする（ローカル時間）
        const dayData = dayForecasts.find((item: any) => {
          const itemDate = new Date(item.dt * 1000);
          return itemDate.getHours() === 12;
        }) || dayForecasts[0];
        
        dailyData.push({
          dt: dayData.dt,
          temp: {
            min: minTemp,
            max: maxTemp
          },
          weather: dayData.weather.map((w: any) => ({
            ...w,
            description: getWeatherDescription(w.id, w.description)
          }))
        });
      } else {
        console.log(`  No data found for day ${i}, using fallback`);
        // その日のデータがない場合は、元の方法でフォールバック
        const fallbackData = forecastList[i * 8] || forecastList[0];
        dailyData.push({
          dt: fallbackData.dt,
          temp: {
            min: fallbackData.main.temp_min,
            max: fallbackData.main.temp_max
          },
          weather: fallbackData.weather.map((w: any) => ({
            ...w,
            description: getWeatherDescription(w.id, w.description)
          }))
        });
      }
    }
    
    return dailyData;
  },

  // 住所検索機能
  async searchLocation(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
    console.log('Searching for location:', query)
    
    // まず都道府県名で検索（完全一致の場合のみ）
    const prefectureMatch = PREFECTURE_CAPITALS[query]
    if (prefectureMatch) {
      console.log('Found exact prefecture match:', prefectureMatch)
      return {
        lat: prefectureMatch.lat,
        lon: prefectureMatch.lon,
        name: prefectureMatch.name
      }
    }
    
    // OpenWeatherMap Geocoding APIを使用
    const searchQueries = [
      `${query},JP`,
      `${query},Japan`,
      query
    ]
    
    for (const searchQuery of searchQueries) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=5&appid=${API_KEY}&lang=ja`
        )
        
        if (!response.ok) {
          console.error('Geocoding API error:', response.status, response.statusText)
          continue
        }
        
        const data = await response.json()
        console.log('Geocoding results for', searchQuery, ':', data)
        
        if (data && data.length > 0) {
          // 日本の場所のみをフィルタリング
          const japaneseLocations = data.filter((location: any) => 
            location.country === 'JP' || 
            location.country === 'Japan' ||
            location.name.includes('Japan') ||
            location.state?.includes('Japan')
          )
          
          if (japaneseLocations.length > 0) {
            const location = japaneseLocations[0]
            console.log('Selected Japanese location:', location)
            
            // 住所名を構築
            let displayName = location.name
            if (location.state && !displayName.includes(location.state)) {
              displayName = `${location.state}${displayName}`
            }
            
            // 都道府県名のみの検索でない場合は、そのまま返す
            if (!PREFECTURE_CAPITALS[query]) {
              return {
                lat: location.lat,
                lon: location.lon,
                name: displayName
              }
            }
            
            // 都道府県名のみの検索の場合は、県庁所在地を返す
            const prefectureData = PREFECTURE_CAPITALS[query]
            if (prefectureData) {
              return {
                lat: prefectureData.lat,
                lon: prefectureData.lon,
                name: prefectureData.name
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in geocoding search:', error)
        continue
      }
    }
    
    console.log('No location found for query:', query)
    return null
  },

  // 逆ジオコーディング（緯度経度から住所を取得）
  async getAddress(lat: number, lon: number): Promise<string> {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}&lang=ja`;
    
    console.log('Fetching address from:', url);
    
    try {
      const response = await fetch(url);
      console.log('Reverse geocoding API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Reverse geocoding API error response:', errorText);
        throw new Error(`Reverse geocoding API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Reverse geocoding data received:', data);
      
      if (data && data.length > 0) {
        const location = data[0];
        
        // 日本語の住所表示を改善
        let address = location.name;
        
        // 都道府県名の日本語マッピング
        const prefectureMap: { [key: string]: string } = {
          'Tokyo': '東京都',
          'Osaka': '大阪府',
          'Kyoto': '京都府',
          'Hokkaido': '北海道',
          'Aichi': '愛知県',
          'Kanagawa': '神奈川県',
          'Saitama': '埼玉県',
          'Chiba': '千葉県',
          'Hyogo': '兵庫県',
          'Fukuoka': '福岡県',
          'Shizuoka': '静岡県',
          'Ibaraki': '茨城県',
          'Hiroshima': '広島県',
          'Miyagi': '宮城県',
          'Niigata': '新潟県',
          'Gunma': '群馬県',
          'Tochigi': '栃木県',
          'Okayama': '岡山県',
          'Kumamoto': '熊本県',
          'Kagoshima': '鹿児島県',
          'Yamaguchi': '山口県',
          'Mie': '三重県',
          'Nagano': '長野県',
          'Fukushima': '福島県',
          'Yamanashi': '山梨県',
          'Gifu': '岐阜県',
          'Wakayama': '和歌山県',
          'Nara': '奈良県',
          'Shiga': '滋賀県',
          'Tottori': '鳥取県',
          'Shimane': '島根県',
          'Tokushima': '徳島県',
          'Kagawa': '香川県',
          'Ehime': '愛媛県',
          'Kochi': '高知県',
          'Saga': '佐賀県',
          'Nagasaki': '長崎県',
          'Oita': '大分県',
          'Miyazaki': '宮崎県',
          'Okinawa': '沖縄県',
          'Iwate': '岩手県',
          'Akita': '秋田県',
          'Yamagata': '山形県',
          'Fukui': '福井県',
          'Ishikawa': '石川県',
          'Toyama': '富山県'
        };
        
        // 都道府県名を日本語に変換
        if (location.state && prefectureMap[location.state]) {
          const japanesePrefecture = prefectureMap[location.state];
          
          // 市区町村名も日本語に変換（主要都市）
          const cityMap: { [key: string]: string } = {
            'Shinjuku': '新宿区',
            'Shibuya': '渋谷区',
            'Minato': '港区',
            'Chiyoda': '千代田区',
            'Chuo': '中央区',
            'Shinagawa': '品川区',
            'Meguro': '目黒区',
            'Setagaya': '世田谷区',
            'Nakano': '中野区',
            'Suginami': '杉並区',
            'Toshima': '豊島区',
            'Kita': '北区',
            'Arakawa': '荒川区',
            'Itabashi': '板橋区',
            'Nerima': '練馬区',
            'Adachi': '足立区',
            'Katsushika': '葛飾区',
            'Edogawa': '江戸川区',
            'Sumida': '墨田区',
            'Koto': '江東区',
            'Ota': '大田区',
            'Osaka': '大阪市',
            'Kyoto': '京都市',
            'Yokohama': '横浜市',
            'Nagoya': '名古屋市',
            'Sapporo': '札幌市',
            'Kobe': '神戸市',
            'Fukuoka': '福岡市',
            'Kawasaki': '川崎市',
            'Saitama': 'さいたま市',
            'Chiba': '千葉市',
            'Sendai': '仙台市',
            'Hiroshima': '広島市'
          };
          
          const japaneseCity = cityMap[location.name] || location.name;
          address = `${japanesePrefecture}${japaneseCity}`;
        } else if (location.country === 'JP' || location.country === 'Japan') {
          // 日本の場合で都道府県名が不明な場合は、そのまま使用
          address = location.name;
        }
        
        return address;
      }
      
      return '住所が見つかりませんでした';
    } catch (error) {
      console.error('Error fetching address:', error);
      return '住所の取得に失敗しました';
    }
  }
};

// 天気アイコンのマッピング
export const getWeatherIcon = (weatherMain: string, iconCode: string): string => {
  const iconMap: { [key: string]: string } = {
    '01d': 'sunny', // 晴れ
    '01n': 'clear-night',
    '02d': 'cloudy', // 曇り
    '02n': 'cloudy',
    '03d': 'cloudy',
    '03n': 'cloudy',
    '04d': 'cloudy',
    '04n': 'cloudy',
    '09d': 'rainy', // 雨
    '09n': 'rainy',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'snowy', // 雪
    '13n': 'snowy',
    '50d': 'foggy',
    '50n': 'foggy',
  };
  
  return iconMap[iconCode] || 'sunny';
};

// 天気の日本語表示マッピング
export const getWeatherDescription = (weatherId: number, description: string): string => {
  const weatherMap: { [key: number]: string } = {
    // 晴れ
    800: '晴れ',
    // 曇り
    801: '薄い曇り',
    802: '曇り',
    803: '厚い曇り',
    804: '曇り',
    // 雨
    200: '雷雨',
    201: '雷雨',
    202: '雷雨',
    210: '雷雨',
    211: '雷雨',
    212: '雷雨',
    221: '雷雨',
    230: '雷雨',
    231: '雷雨',
    232: '雷雨',
    300: '霧雨',
    301: '霧雨',
    302: '霧雨',
    310: '霧雨',
    311: '霧雨',
    312: '霧雨',
    313: '霧雨',
    314: '霧雨',
    321: '霧雨',
    500: '小雨',
    501: '雨',
    502: '強い雨',
    503: '非常に強い雨',
    504: '非常に強い雨',
    511: 'みぞれ',
    520: '小雨',
    521: '雨',
    522: '強い雨',
    531: '強い雨',
    // 雪
    600: '小雪',
    601: '雪',
    602: '大雪',
    611: 'みぞれ',
    612: 'みぞれ',
    613: 'みぞれ',
    615: '雨と雪',
    616: '雨と雪',
    620: '雨と雪',
    621: '雪',
    622: '大雪',
    // 霧
    701: '霧',
    711: '煙霧',
    721: 'もや',
    731: '砂塵',
    741: '霧',
    751: '砂',
    761: '砂塵',
    762: '火山灰',
    771: '突風',
    781: '竜巻',
  };

  return weatherMap[weatherId] || description;
};

// 天気に応じたアドバイスを生成
export const generateAdvice = (weatherData: WeatherData) => {
  const current = weatherData.current;
  const temp = current.temp;
  const weatherMain = current.weather[0].main.toLowerCase();
  const humidity = current.humidity;
  const windSpeed = current.wind_speed;

  let clothing = '';
  let items = '';
  let transportation = '';
  let laundry = '';

  // 服装アドバイス
  if (temp < 10) {
    clothing = 'コートやダウンジャケットが必要です。マフラーや手袋も忘れずに。';
  } else if (temp < 20) {
    clothing = '長袖シャツやカーディガンで調整しやすい服装が良いでしょう。';
  } else if (temp < 25) {
    clothing = '半袖シャツで快適に過ごせます。日焼け止めを忘れずに。';
  } else {
    clothing = '涼しい服装で熱中症に注意してください。';
  }

  // 持ち物アドバイス
  if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
    items = '傘やレインコートを持参してください。';
  } else if (weatherMain.includes('snow')) {
    items = '防寒具と滑り止めの靴を準備してください。';
  } else if (temp > 25) {
    items = '水分補給のための飲み物を持参してください。';
  } else {
    items = '特に追加の持ち物は必要ありません。';
  }

  // 交通アドバイス
  if (weatherMain.includes('rain') || weatherMain.includes('snow')) {
    transportation = '路面が滑りやすくなっているため、公共交通機関の利用をお勧めします。';
  } else if (windSpeed > 20) {
    transportation = '強風のため、自転車やバイクの利用は注意が必要です。';
  } else {
    transportation = '通常通りの交通手段で問題ありません。';
  }

  // 洗濯物アドバイス（優先度順）
  if (weatherMain.includes('rain') || weatherMain.includes('snow') || 
      (weatherData.hourly.some(hour => hour.pop > 0.4))) {
    // 雨が降る見込みの場合
    laundry = '外干しは避け、室内干しか乾燥機の利用をおすすめします。';
  } else if (humidity >= 80) {
    // 湿度が高い場合
    laundry = '乾きにくくなるため、除湿機や扇風機の併用がおすすめです。';
  } else if (windSpeed >= 7) {
    // 風が強い場合
    laundry = '飛ばされないよう、洗濯バサミを多めに使いましょう。';
  } else if (temp > 25 && humidity < 60) {
    // 晴れていて乾燥している場合
    laundry = '絶好の洗濯日和！外干しでしっかり乾きます。';
  } else if (temp < 20 && windSpeed > 3) {
    // 気温が低いが風がある場合
    laundry = '外干しでも乾きますが、時間がかかるかもしれません。';
  } else {
    // それ以外の場合
    laundry = '通常通り外干しで問題ありません。';
  }

  return { clothing, items, transportation, laundry };
}; 