import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FooterComponent } from '../../../components/footer/footer.component';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
  selector: 'app-qr-usuario',
  templateUrl: './qr-usuario.page.html',
  styleUrls: ['./qr-usuario.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FooterComponent,
    HeaderComponent,
  ],
})
export class QrUsuarioPage implements OnInit, AfterViewInit, OnDestroy {
  totalParticipantes: number = 0;
  participantesPresentes: number = 0;
  html5QrcodeScanner!: Html5QrcodeScanner;

  constructor() {}

  ngOnInit() {
    this.initializeParticipants();
  }

  ngAfterViewInit() {
    this.startQrScanner();
  }

  ngOnDestroy() {
    // Detener el escáner y limpiar recursos al destruir el componente
    if (this.html5QrcodeScanner) {
      this.html5QrcodeScanner.clear();
    }
  }

  initializeParticipants() {
    // Inicializa el total de participantes, puedes obtenerlo de un servicio
    this.totalParticipantes = 20; // Reemplaza con el valor real si lo obtienes de un servicio
    this.participantesPresentes = 0;
  }

  startQrScanner() {
    this.html5QrcodeScanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: 250 },
      false
    );

    this.html5QrcodeScanner.render(
      this.onScanSuccess.bind(this),
      this.onScanFailure.bind(this)
    );
  }

  onScanSuccess(qrCodeMessage: string) {
    console.log(`Código QR escaneado: ${qrCodeMessage}`);

    // Aquí podrías validar el QR escaneado y verificar si corresponde a un participante
    if (this.isValidParticipant(qrCodeMessage)) {
      this.participantesPresentes++;
      // Opcional: mostrar feedback visual al usuario
      alert('Participante registrado exitosamente!');
    } else {
      console.warn('Código QR no válido para el participante.');
      alert('Este código QR no es válido.');
    }
  }

  onScanFailure(error: any) {
    console.warn(`Error de escaneo: ${error}`);
  }

  isValidParticipant(qrCodeMessage: string): boolean {
    // Verifica si el código QR escaneado corresponde a un participante válido
    // Aquí podrías agregar lógica para verificar el contenido del QR
    return true; // Actualiza la lógica según tus requisitos
  }
}
