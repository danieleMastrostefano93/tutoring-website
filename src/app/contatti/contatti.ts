import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ErrorPopupService } from '../error-popup/error-popup.service';
import { SuccessPopupService } from '../success-popup/success-popup.service';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-contatti',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contatti.html',
  styleUrl: './contatti.css',
})
export class Contatti {
  formErrors: string[] = [];

  constructor(
    private successPopupService: SuccessPopupService,
    private errorPopupService: ErrorPopupService,
    private firestore: Firestore
  ) {}

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  async onSubmit(form: NgForm) {
    this.formErrors = [];
    const controls = form.controls;

    if (!controls['name']?.value) {
      this.formErrors.push('Il nome è obbligatorio.');
    }

    if (!controls['surname']?.value) {
      this.formErrors.push('Il cognome è obbligatorio.');
    }

    const email = controls['email']?.value;
    if (!email) {
      this.formErrors.push("L'email è obbligatoria.");
    } else if (!this.validateEmail(email)) {
      this.formErrors.push('Formato email non valido.');
    }

    const telefono = controls['phone']?.value;
    if (!telefono) {
      this.formErrors.push('Il numero di telefono è obbligatorio.');
    } else if (!/^[0-9]{10,15}$/.test(telefono)) {
      this.formErrors.push('Inserisci un numero valido (10-15 cifre).');
    }

    if (!controls['education']?.value) {
      this.formErrors.push('Seleziona un titolo di studio.');
    }

    if (!controls['message']?.value) {
      this.formErrors.push('Il messaggio è obbligatorio.');
    }

    // Se ci sono errori, mostra il pop-up con messaggio d'errore riferito al primo controllo fallito
    if (this.formErrors.length > 0) {
      this.errorPopupService.showError(this.formErrors[0]);
      return;
    }

    // Se tutto è valido, lo salvo in una collection firestore:
    // Salvo i valori della form in dei parametri all'interno di un oggetto formData
    const formData = {
      name: controls['name'].value,
      surname: controls['surname'].value,
      email: controls['email'].value,
      phone: controls['phone'].value,
      education: controls['education'].value,
      message: controls['message'].value,
      timestamp: new Date(),
    };
    // Eseguo la chiamata a firestore per aggiungere un documento nella collection
    try {
      const docRef = await addDoc(
        collection(this.firestore, 'Contatti'),
        formData
      );
      form.resetForm(); // Pulisce tutti i campi e resetta lo stato del form (metodo fornito da ngForm)
      this.successPopupService.setShowButton(false);
      this.successPopupService.showSuccessMessage(
        'I tuoi dati sono stati inviati con successo.'
      );
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
      console.log(formData);
    }
  }
}
