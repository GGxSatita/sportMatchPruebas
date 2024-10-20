import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, addDoc, collectionData, Timestamp ,query, orderBy} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IonItem, IonInput, IonButton, IonList, IonLabel, IonAvatar, IonContent } from "@ionic/angular/standalone";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';
import { map } from 'rxjs/operators';
import { ModelsAuth } from 'src/app/models/auth.models';

@Component({
  selector: 'app-club-chat',
  templateUrl: './club-chat.component.html',
  styleUrls: ['./club-chat.component.scss'],
  standalone: true,
  imports: [
    IonAvatar,
    CommonModule,
    IonItem,
    IonButton,
    IonInput,
    IonList,
    IonLabel,
    IonContent,
    ReactiveFormsModule
  ]
})
export class ClubChatComponent implements OnInit {
  @Input() clubId: string;
  messages: Observable<any[]>;
  chatForm: FormGroup;
  userId: string = '';
  username: string = '';
  userPhotoUrl: string = 'assets/default-avatar.png';

  constructor(
    private firestore: Firestore,
    private fb: FormBuilder,
    private authService: AutenticacionService
  ) {}

  async ngOnInit() {
    // Inicializar el formulario reactivo
    this.chatForm = this.fb.group({
      message: ['', Validators.required]
    });

    // Consultar los mensajes del club, ordenándolos por timestamp de forma ascendente
    const messagesCollection = collection(this.firestore, `clubs/${this.clubId}/messages`);
    const messagesQuery = query(messagesCollection, orderBy('timestamp', 'asc'));

    this.messages = collectionData(messagesQuery, {
      idField: 'id',
    }).pipe(
      map(messages => messages.map(message => ({
        ...message,
        timestamp: this.convertToDate(message['timestamp']) // Convertir el timestamp adecuadamente
      })))
    );

    // Obtener el usuario actual y su perfil
    const currentUser = await this.authService.getCurrentUser();
    if (currentUser) {
      const userProfile = await this.authService.getUserProfile(currentUser.uid) as ModelsAuth.UserProfile;
      this.userId = currentUser.uid;
      this.username = userProfile?.name || 'Usuario';
      this.userPhotoUrl = userProfile?.photo || 'assets/default-avatar.png';
    }
  }

  convertToDate(timestamp: any): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    } else if (timestamp instanceof Date) {
      return timestamp;
    } else if (typeof timestamp === 'object' && timestamp?.seconds) {
      // Si es un objeto con 'seconds' como un Firestore Timestamp en formato de objeto
      return new Date(timestamp.seconds * 1000);
    } else {
      return new Date(); // Devolver la fecha actual como valor predeterminado
    }
  }

  async sendMessage() {
    if (this.chatForm.valid) {
      const messageContent = this.chatForm.value.message.trim();
      if (messageContent) {
        const message = {
          userId: this.userId,
          username: this.username,
          userPhotoUrl: this.userPhotoUrl,
          content: messageContent,
          timestamp: new Date(),
        };

        try {
          await addDoc(collection(this.firestore, `clubs/${this.clubId}/messages`), message);
          this.chatForm.reset(); // Limpiar el formulario después de enviar el mensaje
        } catch (error) {
          console.error('Error al enviar el mensaje:', error);
        }
      }
    }
  }
}
