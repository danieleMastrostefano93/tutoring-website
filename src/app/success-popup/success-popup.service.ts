import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SuccessPopup } from './success-popup';

@Injectable({ providedIn: 'root' })
export class SuccessPopupService {
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {}

  showSuccessMessage() {
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

    const popupPortal = new ComponentPortal(SuccessPopup);
    const componentRef = this.overlayRef.attach(popupPortal);

    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());
  }
}
