import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ErrorPopup } from './error-popup';

@Injectable({ providedIn: 'root' })
export class ErrorPopupService {
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {}

  showError(message: string) {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    const popupPortal = new ComponentPortal(ErrorPopup);
    const componentRef = this.overlayRef.attach(popupPortal);
    componentRef.instance.message = message;

    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());
  }
}
