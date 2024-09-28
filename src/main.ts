import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';

//firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, initializeFirestore, persistentLocalCache, provideFirestore } from '@angular/fire/firestore';
import { getAuth, indexedDBLocalPersistence, initializeAuth, provideAuth } from '@angular/fire/auth';

import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ScreenTrackingService, getAnalytics, provideAnalytics, UserTrackingService } from '@angular/fire/analytics';
import { Capacitor } from '@capacitor/core';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { IonicStorageModule } from '@ionic/storage-angular';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({innerHTMLTemplatesEnabled: true, backButtonText: ''}),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // firebase
    provideFirebaseApp(() => {
      const app = initializeApp(environment.firebaseConfig);

      // Configuración condicional según la plataforma
      if (Capacitor.isNativePlatform()) {
        // Configuración especial para plataformas nativas
        initializeFirestore(app, {
          localCache: persistentLocalCache(),
        });
        initializeAuth(app, {
          persistence: indexedDBLocalPersistence
        });
      } else {
        // Configuración para plataformas web con un objeto vacío como ajustes
        initializeFirestore(app, {}); // Aquí pasamos un objeto vacío como segundo argumento
        initializeAuth(app, {}); // También aplicamos el mismo principio a Auth si es necesario
      }

      return app;
    }),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),

    provideFunctions(() => getFunctions()),
    provideAnalytics(() => getAnalytics() ),
    ScreenTrackingService,
    UserTrackingService,
    provideAnimationsAsync(),
    // IonicStorageModule.forRoot()

  ],
});
