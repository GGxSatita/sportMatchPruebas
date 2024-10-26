import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, addDoc, collectionData, Timestamp, query, orderBy, limit, startAfter } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { IonItem, IonInput, IonButton, IonList, IonLabel, IonAvatar, IonContent, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent } from "@ionic/angular/standalone";
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
    IonInfiniteScrollContent,
    IonInfiniteScroll,
    IonIcon,
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
  private lastVisibleMessage: any = null;
  private batchSize: number = 20;
  hasMoreMessages: boolean = true;

  @ViewChild('messagesContainer', { static: false }) messagesContainer: ElementRef;

  constructor(
    private firestore: Firestore,
    private fb: FormBuilder,
    private authService: AutenticacionService
  ) {}

  async ngOnInit() {
    this.chatForm = this.fb.group({
      message: ['', Validators.required]
    });

    this.loadInitialMessages();

    const currentUser = await this.authService.getCurrentUser();
    if (currentUser) {
      const userProfile = await this.authService.getUserProfile(currentUser.uid);
      this.userId = currentUser.uid;
      this.username = userProfile?.name || 'Usuario';
      this.userPhotoUrl = userProfile?.photo || 'assets/default-avatar.png';
    }
  }

  loadInitialMessages() {
    const messagesCollection = collection(this.firestore, `clubs/${this.clubId}/messages`);
    const messagesQuery = query(
      messagesCollection,
      orderBy('timestamp', 'desc'),
      limit(this.batchSize)
    );

    this.messages = collectionData(messagesQuery, { idField: 'id' }).pipe(
      map(messages => {
        if (messages.length > 0) {
          this.lastVisibleMessage = messages[messages.length - 1];
          this.hasMoreMessages = messages.length === this.batchSize;
        } else {
          this.hasMoreMessages = false;
        }
        setTimeout(() => this.scrollToBottom(), 100); // Desplazar al fondo después de cargar mensajes
        return messages.reverse().map(message => ({
          ...message,
          timestamp: this.convertToDate(message['timestamp'])
        }));
      })
    );
  }

  async loadMoreMessages(event: any) {
    if (!this.lastVisibleMessage) {
      event.target.complete();
      return;
    }

    const messagesCollection = collection(this.firestore, `clubs/${this.clubId}/messages`);
    const messagesQuery = query(
      messagesCollection,
      orderBy('timestamp', 'desc'),
      startAfter(this.lastVisibleMessage['timestamp']),
      limit(this.batchSize)
    );

    const newMessages = await collectionData(messagesQuery, { idField: 'id' }).toPromise();
    if (newMessages && newMessages.length > 0) {
      this.lastVisibleMessage = newMessages[newMessages.length - 1];
      this.hasMoreMessages = newMessages.length === this.batchSize;
      this.messages = this.messages.pipe(
        map(existingMessages => [
          ...newMessages.reverse().map(message => ({
            ...message,
            timestamp: this.convertToDate(message['timestamp'])
          })),
          ...existingMessages
        ])
      );
    } else {
      this.hasMoreMessages = false;
    }

    event.target.complete();
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
          timestamp: Timestamp.now()
        };

        try {
          await addDoc(collection(this.firestore, `clubs/${this.clubId}/messages`), message);
          this.chatForm.reset();
          setTimeout(() => this.scrollToBottom(), 100); // Desplazar al fondo después de enviar el mensaje
        } catch (error) {
          console.error('Error al enviar el mensaje:', error);
        }
      }
    }
  }

  scrollToBottom() {
    if (this.messagesContainer && this.messagesContainer.nativeElement) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  convertToDate(timestamp: any): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    } else if (timestamp instanceof Date) {
      return timestamp;
    } else if (typeof timestamp === 'object' && timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000);
    } else {
      return new Date(); // Fecha actual como valor predeterminado si el formato no es reconocido
    }
  }
}
