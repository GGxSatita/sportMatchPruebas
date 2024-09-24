export namespace ModelsAuth {
  export const PathUsers = 'Users'

  export interface DatosRegister {
    email: string;
    password: string;
  }
  export interface DatosLogin {
    email: string;
    password: string;
  }

  export interface UpdateProfileI {
    displayName?: string;
    photoURL: string;
  }

  export interface UserProfile {
    name: string;
    photo: string;
    edad: string;
    id: string;
    email: string;
  }
}
