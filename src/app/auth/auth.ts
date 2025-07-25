import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SuccessPopupService } from '../success-popup/success-popup.service';
import { ErrorPopupService } from '../error-popup/error-popup.service';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
})
export class Auth {
  authForm: FormGroup;
  isLoginMode = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private successPopupService: SuccessPopupService,
    private errorPopupService: ErrorPopupService
  ) {
    this.authForm = this.fb.group({
      nome: [''],
      cognome: [''],
      telefono: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.setValidators(); // inizializza i validatori corretti
  }

  private setValidators(): void {
    const { nome, cognome, telefono } = this.authForm.controls;

    if (this.isLoginMode) {
      nome.clearValidators();
      cognome.clearValidators();
      telefono.clearValidators();
    } else {
      nome.setValidators([Validators.required]);
      cognome.setValidators([Validators.required]);
      telefono.setValidators([
        Validators.required,
        Validators.pattern(/^[0-9]{10,15}$/),
      ]);
    }

    nome.updateValueAndValidity();
    cognome.updateValueAndValidity();
    telefono.updateValueAndValidity();
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.setValidators();
  }

  private showFieldErrors(): void {
    const controls = this.authForm.controls;

    if (!this.isLoginMode) {
      if (controls['nome'].invalid) {
        this.errorPopupService.showError('Il nome è obbligatorio.');
      }

      if (controls['cognome'].invalid) {
        this.errorPopupService.showError('Il cognome è obbligatorio.');
      }

      if (controls['telefono'].invalid) {
        this.errorPopupService.showError(
          'Il numero di telefono deve contenere da 10 a 15 cifre.'
        );
      }
    }

    if (controls['email'].invalid) {
      if (controls['email'].errors?.['required']) {
        this.errorPopupService.showError('L’email è obbligatoria.');
      } else if (controls['email'].errors?.['email']) {
        this.errorPopupService.showError('Inserisci un’email valida.');
      }
    }

    if (controls['password'].invalid) {
      if (controls['password'].errors?.['required']) {
        this.errorPopupService.showError('La password è obbligatoria.');
      } else if (controls['password'].errors?.['minlength']) {
        this.errorPopupService.showError(
          'La password deve contenere almeno 6 caratteri.'
        );
      }
    }
  }

  onSubmit() {
    this.authForm.markAllAsTouched(); // forza visualizzazione errori

    if (this.authForm.invalid) {
      this.showFieldErrors(); //mostra errori specifici
      return;
    }

    if (this.isLoginMode) {
      const { email, password } = this.authForm.value;
      this.authService
        .login(email, password)
        .then((user) => {
          localStorage.setItem('userId', user.uid);
          this.router.navigate(['/materiale']);
        })
        .catch(() => {
          this.errorPopupService.showError(
            'Credenziali non valide o utente non registrato.'
          );
        });
    } else {
      const { email, password, nome, cognome, telefono } = this.authForm.value;
      this.authService
        .register(email, password, { nome, cognome, telefono })
        .then((user) => {
          localStorage.setItem('userId', user.uid);
          this.authForm.reset(); // pulizia form
          this.successPopupService.setShowButton(true); //mostra bottone torna indietro (solo per registrazione)
          this.successPopupService.showSuccessMessage(
            'Registrazione avvenuta con successo.'
          );
        })
        .catch((error) => {
          if (error.code === 'auth/email-already-in-use') {
            this.errorPopupService.showError('Email già registrata.');
          } else {
            this.errorPopupService.showError(
              'Errore durante la registrazione.'
            );
          }
        });
    }
  }
}
