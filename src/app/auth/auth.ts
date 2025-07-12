import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SuccessPopupService } from '../success-popup/success-popup.service';
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
    private successPopupService: SuccessPopupService
  ) {
    this.authForm = this.fb.group({
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      telefono: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit() {
    if (this.isLoginMode) {
      const { email, password } = this.authForm.value;
      this.authService.login(email, password).then((user) => {
        localStorage.setItem('userId', user.uid);
        this.router.navigate(['/materiale']);
      });
    } else {
      const { email, password, nome, cognome, telefono } = this.authForm.value;
      this.authService
        .register(email, password, { nome, cognome, telefono })
        .then((user) => {
          localStorage.setItem('userId', user.uid);
          this.successPopupService.showSuccessMessage();
        });
    }
  }
}
