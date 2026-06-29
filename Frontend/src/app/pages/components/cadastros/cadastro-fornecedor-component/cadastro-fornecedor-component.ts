import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FornecedorService, Fornecedor } from '../../../../core/services/erp/fornecedor.service';
import { ModalService } from '../../../../core/services/ui/modal.service';
import { forkJoin } from 'rxjs';
import { ProdutoService } from '../../../../core/services/erp/Produto.service';
import { NotaRecebimentoService } from '../../../../core/services/erp/NotaRecebimento.service';

export interface ItemProdutoXml {
  numeroItem: number;
  codigoProduto: string;
  descricao: string;
  ean: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

@Component({
  selector: 'app-cadastro-fornecedor-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-fornecedor-component.html',
  styleUrl: './cadastro-fornecedor-component.css',
})
export class CadastroFornecedorComponent {
  
  public isLoadingXml: boolean = false;
  public isLoadingFoto: boolean = false;
  public isSaving: boolean = false;

  public produtosDoXml: ItemProdutoXml[] = [];

  fornecedor: Fornecedor = {
    id: undefined,
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    cnaePrincipal: '',
    crt: undefined,
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    cMun: '',
    telefone: '',
    email: '',
    chavePix: '',
    leadTime: 0,
    limiteCredito: 0.0,
    observacoes: '',
    foto: undefined
  };

  arquivoFotoSelecionado: File | null = null;
  
  @Output() salvoComSucesso = new EventEmitter<void>();

  constructor(
    private service: FornecedorService,
    private notaService: NotaRecebimentoService,
    private produtoService: ProdutoService, 
    private cdr: ChangeDetectorRef, 
    private modalService: ModalService
  ) {
    console.log('[TRACKING-FRONT] CadastroFornecedorComponent inicializado.');
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.isLoadingXml = true;
    this.produtosDoXml = [];

    this.notaService.importarXml(file).subscribe({
      next: (dados: any) => {
        if (!dados) {
          this.isLoadingXml = false;
          return;
        }

        let itensDetectados: any[] = dados.itens || dados.det || dados.produtos || [];

        this.produtosDoXml = itensDetectados.map((item: any, index: number) => {
          const p = item.prod || item; 
          return {
            numeroItem: Number(item.numeroItem || item['$']?.nItem || (index + 1)),
            codigoProduto: p.codigoProdutoFornecedor || p.cProd || '',
            descricao: p.descricaoNota || p.xProd || '',
            ean: p.ean || p.cEAN || 'SEM GTIN',
            unidade: p.unidadeComercial || p.uCom || '',
            quantidade: Number(p.quantidadeFaturada || p.qCom || 0),
            valorUnitario: Number(p.valorUnitario || p.vUnCom || 0),
            valorTotal: Number(p.valorTotal || p.vProd || 0)
          };
        });

        const fData = dados.fornecedor || dados.emit || dados;
        const ender = fData.enderEmit || fData;

        Object.assign(this.fornecedor, {
          id: fData.id || this.fornecedor.id,
          cnpj: fData.cnpj || fData.CNPJ || '',
          razaoSocial: fData.razaoSocial || fData.xNome || '',
          nomeFantasia: fData.nomeFantasia || fData.xFant || '',
          inscricaoEstadual: fData.inscricaoEstadual || fData.IE || '',
          inscricaoMunicipal: fData.inscricaoMunicipal || fData.IM || '',
          cnaePrincipal: fData.cnaePrincipal || fData.CNAE || '',
          crt: fData.crt !== undefined && fData.crt !== null ? Number(fData.crt) : (fData.CRT ? Number(fData.CRT) : undefined),
          logradouro: fData.logradouro || ender.xLgr || '',
          numero: fData.numero || ender.nro || '',
          complemento: fData.complemento || ender.xCpl || '',
          bairro: fData.bairro || ender.xBairro || '',
          cidade: fData.cidade || ender.xMun || '',
          uf: fData.uf || ender.UF || '',
          cep: fData.cep || ender.CEP || '',
          cMun: fData.cMun || fData.cmun || ender.cMun || '', 
          telefone: fData.telefone || ender.fone || '',
          email: fData.email || '',
          chavePix: fData.chavePix || '',
          leadTime: fData.leadTime !== undefined ? fData.leadTime : 0,
          limiteCredito: fData.limiteCredito !== undefined ? fData.limiteCredito : 0.0,
          observacoes: fData.observacoes || '',
          foto: fData.foto || this.fornecedor.foto
        });

        this.isLoadingXml = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.isLoadingXml = false;
        console.error('[TRACKING-FRONT] Erro retornado pelo barramento de notas:', err);

        // TRATAMENTO ADICIONADO: Captura o erro 409 enviado pelo backend
        if (err.status === 409) {
          alert('Atenção: Esta NF-e (Chave de Acesso) já foi importada anteriormente no sistema OrionERP.');
        } else if (err.status === 403) {
          alert('Permissão negada: Seu usuário atual não tem privilégios para importar arquivos fiscais.');
        } else {
          alert(`Erro ao processar o arquivo XML: ${err.error?.message || err.message || 'Formato ou estrutura inválida.'}`);
        }
        
        this.cdr.detectChanges();
      }
    });
  }

  onFotoSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.arquivoFotoSelecionado = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.fornecedor.foto = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  salvar() {
    if (!this.fornecedor.cnpj || !this.fornecedor.razaoSocial) {
      alert('CNPJ e Razão Social são obrigatórios!');
      return;
    }

    setTimeout(() => {
      this.isSaving = true;
      this.cdr.markForCheck();
    }, 0);

    // 🛡️ SANEAMENTO DO PAYLOAD: Tratamento seguro para evitar Erro 400 no Jackson
    // Criamos uma cópia do objeto usando 'any' temporariamente para poder limpar e anular propriedades numéricas vazias sem quebrar o compilador do TS
    const payloadFormatado: any = { ...this.fornecedor };

    // Tratamento do CRT
    if (payloadFormatado.crt === '' || payloadFormatado.crt === undefined || payloadFormatado.crt === null) {
      payloadFormatado.crt = null;
    } else {
      payloadFormatado.crt = Number(payloadFormatado.crt);
    }

    // Tratamento do Lead Time
    if (payloadFormatado.leadTime === '' || payloadFormatado.leadTime === undefined || payloadFormatado.leadTime === null) {
      payloadFormatado.leadTime = null;
    } else {
      payloadFormatado.leadTime = Number(payloadFormatado.leadTime);
    }

    // Tratamento do Limite de Crédito
    if (payloadFormatado.limiteCredito === '' || payloadFormatado.limiteCredito === undefined || payloadFormatado.limiteCredito === null) {
      payloadFormatado.limiteCredito = null;
    } else {
      payloadFormatado.limiteCredito = Number(payloadFormatado.limiteCredito);
    }

    console.log('[TRACKING-FRONT] Enviando payload saneado para o backend:', payloadFormatado);

    // Enviamos o payloadFormatado (como any) para o service
    this.service.salvar(payloadFormatado).subscribe({
      next: (fornecedorSalvo) => {
        console.log('[TRACKING-FRONT] Fornecedor persistido. ID obtido:', fornecedorSalvo.id);
        
        if (this.produtosDoXml && this.produtosDoXml.length > 0 && fornecedorSalvo.id) {
          this.guardarEVincularProdutosDoXml(fornecedorSalvo.id, fornecedorSalvo);
        } else {
          this.verificarUploadFoto(fornecedorSalvo);
        }
      },
      error: (err) => {
        console.error('[TRACKING-FRONT] Erro ao salvar o fornecedor:', err);
        setTimeout(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        }, 0);

        if (err.status === 409) {
          alert('Erro de Consistência: Já existe um fornecedor cadastrado com este CNPJ.');
        } else if (err.status === 400) {
          alert('Erro 400 (Bad Request): O servidor rejeitou os dados. Verifique o console do Spring Boot para ver detalhes do mapeamento.');
        } else {
          alert(`Erro ao salvar fornecedor no servidor [Status ${err.status}].`);
        }
      }
    });
  }

  private guardarEVincularProdutosDoXml(fornecedorId: number, fornecedorSalvo: any) {
    console.log(`[TRACKING-FRONT] Transmitindo lote de produtos para o ID: ${fornecedorId}`);
    
    const requisicoesDeCadastro = this.produtosDoXml.map(item => {
      const payloadProduto = {
        codigoBarras: item.ean !== 'SEM GTIN' ? item.ean : '',
        descricao: item.descricao,
        unidadeMedida: item.unidade,
        categoria: 'GERAL', 
        status: 'ATIVO',
        estoqueMinimo: 0,
        estoqueMaximo: 100,
        localizacaoFisica: 'ALMOXARIFADO',
        precoCusto: item.valorUnitario,
        margemLucro: 50.0, 
        precoVenda: item.valorUnitario * 1.5,
        ncm: (item as any).ncm || '00000000', 
        cest: '',
        origemProduto: 0,
        cstIcms: '00',
        aliquotaIcms: 0,
        aliquotaPis: 0,
        aliquotaCofins: 0,
        fornecedorId: fornecedorId 
      };
      return this.produtoService.cadastrar(payloadProduto);
    });

    forkJoin(requisicoesDeCadastro).subscribe({
      next: (produtosCadastrados) => {
        console.log(`[TRACKING-FRONT] Sucesso: ${produtosCadastrados.length} SKUs integrados.`);
        this.verificarUploadFoto(fornecedorSalvo);
      },
      error: (err) => {
        console.error('[TRACKING-FRONT] Erro detectado no lote de produtos. Iniciando Rollback automático do fornecedor...', err);
        
        this.service.deletar(fornecedorId).subscribe({
          next: () => {
            console.log(`[TRACKING-FRONT] Rollback concluído. Fornecedor ${fornecedorId} e Rascunhos de Notas limpos com sucesso.`);
            setTimeout(() => {
              this.isSaving = false;
              this.cdr.detectChanges();
            }, 0);
            alert(`Falha na gravação do lote de produtos da Nota: ${err.error?.message || 'Dados inválidos em um dos itens'}. O processo foi abortado e os dados temporários foram limpos.`);
          },
          error: (rollbackErr: any) => {
            console.error('[TRACKING-FRONT] Falha ao executar o rollback do fornecedor órfão:', rollbackErr);
            setTimeout(() => {
              this.isSaving = false;
              this.cdr.detectChanges();
            }, 0);

            // TRATAMENTO ADICIONADO: Alerta se o backend falhar durante a deleção do rollback
            if (rollbackErr.status === 409) {
              alert('Atenção: Houve um erro nos produtos, mas o fornecedor não pôde ser limpo automaticamente devido a Notas Fiscais presas a ele no banco.');
            } else {
              alert('Erro crítico: Falha ao executar limpeza preventiva de dados órfãos após erro nos itens da nota.');
            }
          }
        });
      }
    });
  }

  private verificarUploadFoto(fornecedorSalvo: any) {
    if (this.arquivoFotoSelecionado && fornecedorSalvo.id) {
      this.vincularFotoAoFornecedor(fornecedorSalvo.id);
    } else {
      alert('Fornecedor registrado com sucesso!');
      this.finalizarProcessoComSucesso();
    }
  }

  private vincularFotoAoFornecedor(id: number) {
    this.isLoadingFoto = true;
    this.service.uploadFoto(id, this.arquivoFotoSelecionado!).subscribe({
      next: () => {
        alert('Fornecedor, produtos do XML e foto salvos com sucesso!');
        this.isLoadingFoto = false;
        this.finalizarProcessoComSucesso();
      },
      error: (err) => {
        console.error('[TRACKING-FRONT] Falha de upload da imagem:', err);
        this.isLoadingFoto = false;
        setTimeout(() => {
          this.isSaving = false;
          this.cdr.detectChanges();
        }, 0);
        alert('Os dados cadastrais e produtos foram salvos, mas o arquivo de imagem de perfil falhou ou excede o tamanho limite.');
      }
    });
  }

  private finalizarProcessoComSucesso() {
    this.salvoComSucesso.emit();
    this.modalService.notificarFornecedorSalvo();
    this.limparFormulario();
    this.cdr.detectChanges();
  }

  public limparFormulario() {
    this.arquivoFotoSelecionado = null;
    this.produtosDoXml = [];
    
    setTimeout(() => {
      this.isSaving = false;
      this.isLoadingXml = false;
      this.isLoadingFoto = false;
      this.cdr.detectChanges();
    }, 0);

    this.fornecedor = {
      id: undefined,
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      inscricaoEstadual: '',
      inscricaoMunicipal: '',
      cnaePrincipal: '',
      crt: undefined,
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
      cMun: '',
      telefone: '',
      email: '',
      chavePix: '',
      leadTime: 0,
      limiteCredito: 0.0,
      observacoes: '',
      foto: undefined
    };
  }
}