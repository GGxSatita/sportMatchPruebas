import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonCard, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { WeatherService } from 'src/app/services/weather.service';
import { WeatherData } from 'src/app/models/weather-data';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.page.html',
  styleUrls: ['./weather.page.scss'],
  standalone: true,
  imports: [IonGrid, IonRow, IonCol, IonCard, IonIcon, HeaderComponent, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class WeatherPage implements OnInit {
  weatherData: WeatherData | null = null;
  iconUrl: string | null = null;
  weatherIcon: string = 'cloud-outline';
  temperature: number | null = null;
  description: string = '';
  windSpeed: number | null = null;
  humidity: number | null = null;
  location: string = '';
  error: string | null = null;
  weatherClass: string = 'default';
  dailyForecast: any[] = [];

  // Array de tarjetas de información adicional
  weatherCards = [
    { icon: 'water-outline', label: 'Humedad', value: this.humidity + '%' },
    { icon: 'speedometer-outline', label: 'Viento', value: this.windSpeed + ' m/s' },
    { icon: 'cloud-outline', label: 'Descripción', value: this.description },
    { icon: 'location-outline', label: 'Ubicación', value: this.location }
  ];

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.fetchWeatherData();
  }

  private fetchWeatherData() {
    this.weatherService.getWeatherByLocation().subscribe({
      next: (response) => {
        this.weatherData = response;
        this.iconUrl = `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`;
        this.temperature = response.main.temp;
        this.description = response.weather[0].description;
        this.windSpeed = response.wind.speed;
        this.humidity = response.main.humidity;
        this.location = response.name;

        this.weatherClass = this.getWeatherClass(response.weather[0].main);
        this.weatherIcon = this.getWeatherIcon(response.weather[0].main);

        // Actualizamos los valores en `weatherCards`
        this.weatherCards = [
          { icon: 'water-outline', label: 'Humedad', value: this.humidity + '%' },
          { icon: 'speedometer-outline', label: 'Viento', value: this.windSpeed + ' m/s' },
          { icon: 'cloud-outline', label: 'Descripción', value: this.description },
          { icon: 'location-outline', label: 'Ubicación', value: this.location }
        ];
      },
      error: (error) => {
        this.error = "Error obteniendo datos del clima";
        console.error("Error obteniendo datos del clima:", error);
      }
    });
  }

  private getWeatherIcon(condition: string): string {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'sunny-outline';
      case 'clouds':
        return 'cloudy-outline';
      case 'rain':
      case 'drizzle':
        return 'rainy-outline';
      case 'thunderstorm':
        return 'thunderstorm-outline';
      case 'snow':
        return 'snow-outline';
      case 'mist':
      case 'fog':
        return 'cloudy-night-outline';
      default:
        return 'cloud-outline';
    }
  }

  private getWeatherClass(condition: string): string {
    switch (condition.toLowerCase()) {
      case 'clear':
        return 'sunny';
      case 'clouds':
        return 'cloudy';
      case 'rain':
      case 'drizzle':
        return 'rainy';
      case 'thunderstorm':
        return 'stormy';
      case 'snow':
        return 'snowy';
      case 'mist':
      case 'fog':
        return 'foggy';
      default:
        return 'default';
    }
  }

}
