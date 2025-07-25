import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SuccessPopup } from './success-popup';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SuccessPopupService {
  private overlayRef: OverlayRef | null = null;
  private showButtonSubject = new BehaviorSubject<boolean>(false);
  showButton$ = this.showButtonSubject.asObservable();

  constructor(private overlay: Overlay, private router: Router) {
    // Chiudi il popup al cambio di route
    this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        this.overlayRef?.dispose();
        this.overlayRef = null;
      });
  }

  setShowButton(value: boolean) {
    this.showButtonSubject.next(value);
  }

  showSuccessMessage(message: string) {
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
    componentRef.instance.message = message;

    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());
  }
}
