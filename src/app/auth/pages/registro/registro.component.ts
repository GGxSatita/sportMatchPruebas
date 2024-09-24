import { Component, inject, OnInit } from '@angular/core';
import { user } from '@angular/fire/auth';
import { FormBuilder, Validators , FormGroup, FormControl} from '@angular/forms';
import { AutenticacionService } from 'src/app/services/autenticacion.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  autenticacionService: AutenticacionService = inject(AutenticacionService);

  //Formulario
  datosForm = this.fb.group({
    email: ['',[ Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  cargando: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {}

  async registrarse() {
    this.cargando = true;
    console.log('DATOS FORMULARIO ->', this.datosForm.value);
    if (this.datosForm.valid) {
      const data = this.datosForm.value;
      console.log('VALIDOOOOOOOOO ->', data);
      try {
        const user = await this.autenticacionService.createUser(
          data.email ?? '',
          data.password ?? ''
        );
        console.log('user ->', user);
      } catch (error) {
        console.log('REGISTRARSE ERROOOOOOOOR ->',error);
      }
    }
    this.cargando = false;
  }


}
