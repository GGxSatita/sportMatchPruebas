export interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: [
    {
      main: string;
      description: string;
      icon: string;
    }
  ];
  wind: {
    speed: number;
  };
  name: string;
}
