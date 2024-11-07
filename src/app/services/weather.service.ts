import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';
import { WeatherData } from '../models/weather-data';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private apiKey = environment.openWeatherMapApiKey;
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';


  constructor(private http: HttpClient) {}

  getWeatherData(lat: number, lon: number): Observable<WeatherData> {
    const url = `${this.apiUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
    return this.http.get<WeatherData>(url);
  }

  getWeatherByLocation(): Observable<WeatherData> {
    return new Observable<WeatherData>(observer => {
      Geolocation.getCurrentPosition()
        .then(position => {
          const { latitude, longitude } = position.coords;
          const url = `${this.apiUrl}?lat=${latitude}&lon=${longitude}&units=metric&appid=${this.apiKey}`;

          this.http.get<WeatherData>(url).subscribe({
            next: (data) => observer.next(data),
            error: (error) => observer.error(error)
          });
        })
        .catch(error => observer.error(error));
    });
  }

}
