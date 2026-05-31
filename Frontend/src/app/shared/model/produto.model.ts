export interface Produto {
  id?: number;
  descricao: string;
  codigoBarras?: string;
  preco?: number;
  estoque: number;
  status: 'ATIVO' | 'INATIVO';
}