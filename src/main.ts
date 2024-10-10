import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';

// Firebase imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, initializeFirestore, persistentLocalCache, provideFirestore } from '@angular/fire/firestore';
import { getAuth, indexedDBLocalPersistence, initializeAuth, provideAuth } from '@angular/fire/auth';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { ScreenTrackingService, getAnalytics, provideAnalytics, UserTrackingService } from '@angular/fire/analytics';
import { getDatabase, provideDatabase } from '@angular/fire/database'; // Importación para Realtime Database

import { Capacitor } from '@capacitor/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { environment } from './environments/environment';
import { defineCustomElements } from '@ionic/pwa-elements/loader';


//Eleemndos PWA
defineCustomElements(window);

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ innerHTMLTemplatesEnabled: true, backButtonText: '' }),
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Firebase Initialization
    provideFirebaseApp(() => {
      const app = initializeApp(environment.firebaseConfig);

      // Configuración condicional para plataformas nativas vs web
      if (Capacitor.isNativePlatform()) {
        initializeFirestore(app, {
          localCache: persistentLocalCache(),
        });
        initializeAuth(app, {
          persistence: indexedDBLocalPersistence
        });
      } else {
        initializeFirestore(app, {}); // Firestore para la web
        initializeAuth(app, {}); // Auth para la web
      }

      // Devuelve la app inicializada
      return app;
    }),

    // Proveedores de Firebase (Firestore, Auth, Functions, Storage, Analytics y Realtime Database)
    provideFirestore(() => getFirestore()), // Firestore
    provideAuth(() => getAuth()), // Authentication
    provideStorage(() => getStorage()), // Storage
    provideFunctions(() => getFunctions()), // Functions
    provideAnalytics(() => getAnalytics()), // Analytics
    provideDatabase(() => getDatabase()), // Realtime Database

    // Otros servicios de Firebase
    ScreenTrackingService,
    UserTrackingService,

    // Animations (opcional)
    provideAnimationsAsync(),
  ],

});
