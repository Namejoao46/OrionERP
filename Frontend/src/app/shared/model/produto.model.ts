export interface Produto {
  id?: number;
  descricao: string;
  codigoBarras?: string;
  precoVenda?: number;
  estoqueAtual: number;
  status: 'ATIVO' | 'INATIVO';
  categoria?: string;
  unidadeMedida?: string;
  foto?: string;
  fornecedorId?: number; // Prático para amarrar os payloads de envio
}