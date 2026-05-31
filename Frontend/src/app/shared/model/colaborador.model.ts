import { Empresa } from "./empresa.model";

export interface Colaborador {
  id?: number;
  nome: string;
  login: string;
  senha?: string; // Opcional, pois não recebemos a senha do back
  foto?: string;  // Base64 vindo do Java
  role: 'ADMIN_DEV' | 'MASTER' | 'FUNCIONARIO';
  cargo?: string;
  empresa?: Empresa;
}