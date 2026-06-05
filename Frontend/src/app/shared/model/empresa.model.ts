export interface Empresa {
  id?: number;
  nomeFantasia: string; // 👈 Alterado de 'nome' para 'nomeFantasia'
  cnpj?: string;
  plano?: string;       // Adicionado o plano para bater com o Java se necessário
}