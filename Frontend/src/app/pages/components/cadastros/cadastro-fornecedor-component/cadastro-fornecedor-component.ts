import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FornecedorService, Fornecedor } from '../../../../core/services/erp/fornecedor.service';
import { ModalService } from '../../../../core/services/ui/modal.service';

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

  // Inicialização estável do modelo para os inputs
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

  constructor(private service: FornecedorService, private cdr: ChangeDetectorRef, private modalService: ModalService) {
    console.log('[TRACKING-FRONT] CadastroFornecedorComponent inicializado com sucesso.');
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) {
      console.warn('[TRACKING-FRONT] Seleção de arquivo XML cancelada pelo usuário.');
      return;
    }

    console.log(`[TRACKING-FRONT] Arquivo XML selecionado: ${file.name} (${file.size} bytes). Iniciando upload.`);
    this.isLoadingXml = true;

    this.service.importarXml(file).subscribe({
      next: (dados) => {
        console.log('[TRACKING-FRONT] Resposta do backend obtida com sucesso para o XML. Dados brutos recebidos:', dados);
        
        if (!dados) {
          console.warn('[TRACKING-FRONT] Backend retornou estrutura vazia para o XML.');
          this.isLoadingXml = false;
          return;
        }

        const antigoCnpj = this.fornecedor.cnpj;

        // O setTimeout joga a execução para o próximo ciclo de microtasks, mitigando conflitos de checagem
        setTimeout(() => {
          // Atualiza as propriedades mantendo a mesma referência de memória do objeto inicial
          Object.assign(this.fornecedor, {
            id: dados.id || this.fornecedor.id,
            cnpj: dados.cnpj || '',
            razaoSocial: dados.razaoSocial || '',
            nomeFantasia: dados.nomeFantasia || '',
            inscricaoEstadual: dados.inscricaoEstadual || '',
            inscricaoMunicipal: dados.inscricaoMunicipal || '',
            cnaePrincipal: dados.cnaePrincipal || '',
            crt: dados.crt !== undefined && dados.crt !== null ? Number(dados.crt) : undefined,
            logradouro: dados.logradouro || '',
            numero: dados.numero || '',
            complemento: dados.complemento || '',
            bairro: dados.bairro || '',
            cidade: dados.cidade || '',
            uf: dados.uf || '',
            cep: dados.cep || '',
            cMun: dados.cMun || (dados as any).cmun || '', 
            telefone: dados.telefone || '',
            email: dados.email || '',
            chavePix: dados.chavePix || '',
            leadTime: dados.leadTime !== undefined ? dados.leadTime : 0,
            limiteCredito: dados.limiteCredito !== undefined ? dados.limiteCredito : 0.0,
            observacoes: dados.observacoes || '',
            foto: dados.foto || this.fornecedor.foto
          });

          console.log(`[TRACKING-FRONT] Merge de dados concluído na View. CNPJ anterior: "${antigoCnpj}" -> Novo CNPJ: "${this.fornecedor.cnpj}"`);
          this.isLoadingXml = false;
          
          // Força o Angular a recalcular a árvore DOM e aplicar o binding nos inputs
          this.cdr.detectChanges(); 
          
          setTimeout(() => {
            alert('Dados da Nota Fiscal (XML) carregados com sucesso no formulário!');
          }, 50);
        });
      },
      error: (err) => {
        console.error('[TRACKING-FRONT] CRÍTICO: Falha ao processar ou transmitir o XML para o servidor.', err);
        this.isLoadingXml = false;
        alert(`Erro ao processar o arquivo XML: ${err.message || 'Verifique o formato do arquivo.'}`);
      }
    });
  }

  onFotoSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) {
      console.warn('[TRACKING-FRONT] Seleção de foto cancelada pelo usuário.');
      return;
    }

    console.log(`[TRACKING-FRONT] Nova foto capturada no input local: ${file.name} | Tipo: ${file.type}`);
    this.arquivoFotoSelecionado = file;

    const reader = new FileReader();
    console.log('[TRACKING-FRONT] Instanciando FileReader para renderização do preview em memória.');
    
    reader.onload = () => {
      this.fornecedor.foto = reader.result as string;
      console.log('[TRACKING-FRONT] String Base64 gerada com sucesso. Preview updated na View.');
    };
    
    reader.onerror = (fileError) => {
      console.error('[TRACKING-FRONT] Erro ao ler o arquivo de imagem local no navegador:', fileError);
    };

    reader.readAsDataURL(file);
  }

  salvar() {
    console.log('[TRACKING-FRONT] Evento "salvar()" disparado. Executando validações de acesso.');
    
    if (!this.fornecedor.cnpj || !this.fornecedor.razaoSocial) {
      console.warn('[TRACKING-FRONT] Validação recusada: Campos obrigatórios ausentes.', {
        cnpj: this.fornecedor.cnpj,
        razaoSocial: this.fornecedor.razaoSocial
      });
      alert('CNPJ e Razão Social são obrigatórios!');
      return;
    }

    console.log('[TRACKING-FRONT] Formulário válido. Payload preparado para envio:', this.fornecedor);
    this.isSaving = true;

    this.service.salvar(this.fornecedor).subscribe({
      next: (fornecedorSalvo) => {
        console.log('[TRACKING-FRONT] Sucesso na persistência textual. Entidade salva retornada do Banco:', fornecedorSalvo);
        
        if (this.arquivoFotoSelecionado && fornecedorSalvo.id) {
          console.log(`[TRACKING-FRONT] Detectada foto pendente para upload. Encaminhando para o método secundário. ID Alvo: ${fornecedorSalvo.id}`);
          this.vincularFotoAoFornecedor(fornecedorSalvo.id);
        } else {
          console.log('[TRACKING-FRONT] Fluxo de salvamento concluído sem imagem acessória. Resetando tela.');
          alert('Fornecedor registrado com sucesso!');
          this.finalizarProcessoComSucesso();
        }
      },
      error: (err) => {
        console.error('[TRACKING-FRONT] Erro no pipeline de salvamento de texto:', err);
        this.isSaving = false;
        
        if (err.status === 403) {
          console.error('[TRACKING-FRONT] Quebra de barreira de segurança de perfil (403 Forbidden).');
          alert('Acesso negado: Seu nível de acesso atual não possui permissão (ADMIN/MASTER) para esta operação.');
        } else {
          alert(`Erro ao salvar fornecedor no servidor [Status ${err.status}].`);
        }
      }
    });
  }

  private vincularFotoAoFornecedor(id: number) {
    if (!this.arquivoFotoSelecionado) {
      console.warn('[TRACKING-FRONT] Tentativa de upload abortada: Arquivo binário nulo.');
      return;
    }

    console.log(`[TRACKING-FRONT] Iniciando chamada HTTP PUT Multipart/Form-Data para upload da foto. ID: ${id}`);
    this.isLoadingFoto = true;

    this.service.uploadFoto(id, this.arquivoFotoSelecionado).subscribe({
      next: (resultadoFinal) => {
        console.log('[TRACKING-FRONT] Upload da foto executado e processado pelo Storage do Backend.', resultadoFinal);
        alert('Fornecedor e Foto salvos com sucesso!');
        this.isLoadingFoto = false;
        this.finalizarProcessoComSucesso();
      },
      error: (err) => {
        console.error(`[TRACKING-FRONT] Falha ao vincular foto ao ID ${id}. O registro textual foi mantido no banco.`, err);
        this.isLoadingFoto = false;
        this.isSaving = false;
        alert('Os dados cadastrais foram salvos, mas a foto foi recusada ou excedeu o limite do servidor.');
      }
    });
  }

  private finalizarProcessoComSucesso() {
    console.log('[TRACKING-FRONT] Emitindo sinalizador de sucesso para o componente pai (Output).');
    this.salvoComSucesso.emit();
    
    // AQUI ESTÁ A CHAVE: Notifica globalmente o sistema que o banco foi atualizado!
    this.modalService.notificarFornecedorSalvo();
    
    this.limparFormulario();
  }

  public limparFormulario() {
    console.log('[TRACKING-FRONT] Limpando estado local do formulário e referências de arquivos.');
    this.arquivoFotoSelecionado = null;
    this.isSaving = false;
    this.isLoadingXml = false;
    this.isLoadingFoto = false;

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