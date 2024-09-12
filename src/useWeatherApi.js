import { useState, useEffect, useCallback } from "react";

const fetchCurrentWeather = (locationName) => {
  return fetch(
    `https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWA-0F2127DC-5FAB-4CD5-B4EE-86259C9E2111&StationName=${locationName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.Station[0];

      return {
        observationTime: locationData.ObsTime.DateTime,
        locationName: locationData.StationName,
        description: locationData.WeatherElement.Weather,
        temperature: locationData.WeatherElement.AirTemperature,
        windSpeed: locationData.WeatherElement.WindSpeed,
        humid: locationData.WeatherElement.RelativeHumidity,
      };
    });
};

const fetchWeatherForecast = (cityName) => {
  return fetch(
    `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWA-0F2127DC-5FAB-4CD5-B4EE-86259C9E2111&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName,
      };
    });
};

const nowDate = Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})
  .format(new Date())
  .replace(/\//g, "-");

const fetchSunset = (locationName) => {
  return fetch(
    `https://opendata.cwa.gov.tw/api/v1/rest/datastore/A-B0062-001?Authorization=CWA-0F2127DC-5FAB-4CD5-B4EE-86259C9E2111&CountyName=${locationName}&Date=${nowDate}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.locations.location[0];

      return {
        date: locationData.time[0].Date,
        sunRiseTime: locationData.time[0].SunRiseTime,
        sunSetTime: locationData.time[0].SunSetTime,
      };
    });
};

const useWeatherApi = (currentLocation) => {
  const { locationName, cityName } = currentLocation;
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    date: new Date(),
    sunRiseTime: new Date(),
    sunSetTime: new Date(),
    isLoading: true,
  });
  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast, sunSetData] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchWeatherForecast(cityName),
        fetchSunset(cityName),
      ]);
      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        ...sunSetData,
        isLoading: false,
      });
    };

    setWeatherElement((prevData) => {
      return { ...prevData, isLoading: true };
    });

    fetchingData();
  }, [locationName, cityName]);

  useEffect(() => fetchData(), [fetchData]);
  return [weatherElement, fetchData];
};

export default useWeatherApi;
