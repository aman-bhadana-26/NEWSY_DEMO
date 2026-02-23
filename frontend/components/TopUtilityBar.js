import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  WiDaySunny, 
  WiNightClear, 
  WiDayCloudy,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiDayHaze
} from 'react-icons/wi';
import styles from '../styles/TopUtilityBar.module.css';

export default function TopUtilityBar() {
  const [currentDate, setCurrentDate] = useState('');
  const [weather, setWeather] = useState({
    city: 'Loading...',
    temp: '--',
    condition: 'clear',
    isDay: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set current date
    setCurrentDate(format(new Date(), 'MMMM dd, yyyy'));

    // Fetch weather data
    fetchWeather();

    // Refresh weather every 30 minutes
    const weatherInterval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, []);

  const fetchWeather = async () => {
    try {
      // Try to get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await getWeatherByCoords(latitude, longitude);
          },
          () => {
            // Fallback to default city if geolocation fails
            getWeatherByCity('Faridabad');
          }
        );
      } else {
        // Fallback if geolocation not supported
        getWeatherByCity('Faridabad');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  const getWeatherByCoords = async (lat, lon) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'demo';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        updateWeatherState(data);
      } else {
        // Fallback to default city
        getWeatherByCity('Faridabad');
      }
    } catch (error) {
      console.error('Error getting weather by coords:', error);
      getWeatherByCity('Faridabad');
    }
  };

  const getWeatherByCity = async (city) => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'demo';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        updateWeatherState(data);
      } else {
        // Use fallback data if API fails
        setWeather({
          city: 'Faridabad',
          temp: '23',
          condition: 'clear',
          isDay: true
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error getting weather by city:', error);
      // Use fallback data
      setWeather({
        city: 'Faridabad',
        temp: '23',
        condition: 'clear',
        isDay: true
      });
      setLoading(false);
    }
  };

  const updateWeatherState = (data) => {
    const condition = data.weather[0].main.toLowerCase();
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;

    setWeather({
      city: data.name,
      temp: Math.round(data.main.temp),
      condition: condition,
      isDay: isDay
    });
    setLoading(false);
  };

  const getWeatherIcon = () => {
    const { condition, isDay } = weather;

    switch (condition) {
      case 'clear':
        return isDay ? <WiDaySunny className={styles.weatherIcon} /> : <WiNightClear className={styles.weatherIcon} />;
      case 'clouds':
        return isDay ? <WiDayCloudy className={styles.weatherIcon} /> : <WiCloudy className={styles.weatherIcon} />;
      case 'rain':
      case 'drizzle':
        return <WiRain className={styles.weatherIcon} />;
      case 'snow':
        return <WiSnow className={styles.weatherIcon} />;
      case 'thunderstorm':
        return <WiThunderstorm className={styles.weatherIcon} />;
      case 'fog':
      case 'mist':
        return <WiFog className={styles.weatherIcon} />;
      case 'haze':
      case 'smoke':
        return <WiDayHaze className={styles.weatherIcon} />;
      default:
        return isDay ? <WiDaySunny className={styles.weatherIcon} /> : <WiNightClear className={styles.weatherIcon} />;
    }
  };

  // Latest news ticker items (you can fetch these from API later)
  const tickerItems = [
    'Mobile Data, Not Internet Service Providers, To Be Blocked In Bali During Nyepi March 19, 2022',
    'OpenAI Announces GPT-5 With Revolutionary Breakthrough In AI Reasoning',
    'Tesla Unveils New Affordable Electric Vehicle Starting At $25,000',
    'Meta Launches Advanced VR Headset With Brain-Computer Interface',
    'Apple Announces Major iOS Update With AI-Powered Features'
  ];

  return (
    <div className={styles.topBar}>
      <div className={styles.container}>
        {/* Left: Date */}
        <div className={styles.leftSection}>
          <span className={styles.date}>{currentDate}</span>
        </div>

        {/* Center: Ticker */}
        <div className={styles.centerSection}>
          <span className={styles.tickerLabel}>LATEST NEWS</span>
          <div className={styles.tickerWrapper}>
            <div className={styles.tickerContent}>
              {tickerItems.map((item, index) => (
                <span key={index} className={styles.tickerItem}>
                  {item}
                  <span className={styles.tickerDivider}>•</span>
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {tickerItems.map((item, index) => (
                <span key={`dup-${index}`} className={styles.tickerItem}>
                  {item}
                  <span className={styles.tickerDivider}>•</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Location + Weather */}
        <div className={styles.rightSection}>
          <div className={styles.weather}>
            <span className={styles.location}>{weather.city}</span>
            {getWeatherIcon()}
            <span className={styles.temp}>{weather.temp} °C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
