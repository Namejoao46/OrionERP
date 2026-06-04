import { Component, AfterViewInit, ElementRef, ViewChild, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  template: `<canvas #canvas class="sparkline-canvas"></canvas>`,
  styles: [`
    .sparkline-canvas {
      width: 100% !important;
      height: 60% !important;
      display: block;
    }
  `]
})
export class AppSparkline implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() valorAtual: number = 0;
  @Input() sucesso: boolean = true;
  @Input() maxPontosNaTela: number = 10; // Corrigido aqui (sem espaço!)

  public historicoPontos: number[] = [];
  private animationId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['valorAtual']) {
      const novoValor = changes['valorAtual'].currentValue;
      this.historicoPontos.push(novoValor);

      if (this.historicoPontos.length > this.maxPontosNaTela) {
        this.historicoPontos.shift();
      }

      this.agendarRenderizacao();
    }
    
    if (changes['sucesso'] && !changes['valorAtual']) {
      this.agendarRenderizacao();
    }
  }

  ngAfterViewInit(): void {
    this.historicoPontos = Array(this.maxPontosNaTela).fill(this.valorAtual || 0);
    this.agendarRenderizacao();
  }

  ngOnDestroy(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private agendarRenderizacao(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(() => this.renderizar());
  }

  private renderizar(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.getBoundingClientRect().width || 80;
    const height = canvas.getBoundingClientRect().height || 50;
    
    canvas.width = width;
    canvas.height = height;

    const padding = 4;
    const max = Math.max(...this.historicoPontos, 1);
    const min = Math.min(...this.historicoPontos, 0);
    const range = max - min === 0 ? 1 : max - min;

    const corLinha = this.sucesso ? '#2b97fa' : '#ff4d4d';
    const corGradienteInicio = this.sucesso ? 'rgba(43, 151, 250, 0.3)' : 'rgba(255, 77, 77, 0.3)';

    const pontos = this.historicoPontos.map((val, i) => {
      const x = (i / (this.historicoPontos.length - 1)) * width;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return { x, y };
    });

    ctx.clearRect(0, 0, width, height);

    const gradiente = ctx.createLinearGradient(0, 0, 0, height);
    gradiente.addColorStop(0, corGradienteInicio);
    gradiente.addColorStop(1, 'rgba(5, 10, 48, 0)');

    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(pontos[0].x, pontos[0].y);
    for (let i = 0; i < pontos.length - 1; i++) {
      const xc = (pontos[i].x + pontos[i + 1].x) / 2;
      const yc = (pontos[i].y + pontos[i + 1].y) / 2;
      ctx.quadraticCurveTo(pontos[i].x, pontos[i].y, xc, yc);
    }
    ctx.lineTo(pontos[pontos.length - 1].x, pontos[pontos.length - 1].y);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradiente;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pontos[0].x, pontos[0].y);
    for (let i = 0; i < pontos.length - 1; i++) {
      const xc = (pontos[i].x + pontos[i + 1].x) / 2;
      const yc = (pontos[i].y + pontos[i + 1].y) / 2;
      ctx.quadraticCurveTo(pontos[i].x, pontos[i].y, xc, yc);
    }
    ctx.lineTo(pontos[pontos.length - 1].x, pontos[pontos.length - 1].y);
    ctx.strokeStyle = corLinha;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}