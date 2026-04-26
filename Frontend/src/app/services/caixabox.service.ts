import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CaixaboxComponent } from '../pages/components/caixa-box/caixa-box';
import { Subject, Observable } from 'rxjs';
import { CaixaboxOption } from '../pages/components/caixa-box/caixa-box';

@Injectable({ providedIn: 'root' })
export class CaixaboxService {
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {}


  exibir(origin: HTMLElement, options: CaixaboxOption[]): Observable<any> {
    // Fecha qualquer um que esteja aberto
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 5 },
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 5 }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    const resposta = new Subject<any>();
    const portal = new ComponentPortal<CaixaboxComponent>(CaixaboxComponent);
    const componentRef = this.overlayRef.attach(portal);

    // Passa os dados para o componente
    componentRef.instance.options = options;
    componentRef.instance.onSelect = (valor) => {
      resposta.next(valor);
      this.overlayRef?.dispose();
    };

    // Fecha ao clicar fora
    this.overlayRef.backdropClick().subscribe(() => {
      this.overlayRef?.dispose();
      resposta.complete();
    });

    return resposta.asObservable();
  }
}