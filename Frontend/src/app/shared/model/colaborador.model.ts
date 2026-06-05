import { Empresa } from "./empresa.model";

export interface Colaborador {
  id?: number;
  nome: string;
  sobrenome?: string;       // Adicionado
  login: string;            // E-mail
  senha?: string;
  dataNascimento?: string;  // Adicionado (tratado como string para o input do HTML)
  cpf: string;              // Adicionado e obrigatório
  matricula?: string;
  cargo?: string;
  endereco?: string;        // Adicionado
  tipoColaborador?: string; // Adicionado
  role: 'ADMIN_DEV' | 'MASTER' | 'COLABORADOR';
  foto?: string;
  empresa?: Empresa;
}