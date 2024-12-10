export interface Usuario {
  email?: string; // El correo es opcional
  [key: string]: any; // Permitir otros campos no especificados
}
