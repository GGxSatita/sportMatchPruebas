import { ModelsAuth } from "./auth.models";
import * as Desafio from './desafio'; // Importa todos los modelos desde 'desafio'

export * from './desafio'; // Asegúrate de exportar lo necesario
export namespace Models{
  export import Auth = ModelsAuth;
  export import ScoreModel = Desafio.ScoreModel; // Aquí incluyes el ScoreModel
}
