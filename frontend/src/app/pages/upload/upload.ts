import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.html',
  styleUrls: ['./upload.css']
})
export class Upload {
  patientName = '';
  age = '';
  gender = '';

  file: File | null = null;
  previewUrl: string | null = null;

  result: any = null;
  loading = false;
  errorMessage = '';

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    this.file = input.files[0];
    this.errorMessage = '';
    this.result = null;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(this.file);
  }

  submitForm() {
    if (!this.patientName || !this.age || !this.gender || !this.file) {
      this.errorMessage = 'Please fill all fields and upload MRI image.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.result = null;

    const formData = new FormData();
    formData.append('patientName', this.patientName);
    formData.append('age', this.age);
    formData.append('gender', this.gender);
    formData.append('image', this.file);

    this.reportService.uploadMRI(formData).subscribe({
     next: (response: any) => {
  this.result = {
  ...response?.result,
  imagePreview: this.previewUrl
};

this.loading = false;

const oldReports = JSON.parse(localStorage.getItem('mriReports') || '[]');
oldReports.unshift(this.result);
localStorage.setItem('mriReports', JSON.stringify(oldReports));

this.cdr.detectChanges();
},
      error: (error: any) => {
        console.error('UPLOAD ERROR:', error);
        this.loading = false;
        this.errorMessage = 'Something went wrong while analyzing MRI image.';
        this.cdr.detectChanges();
      }
    });
  }

  resetForm() {
    this.patientName = '';
    this.age = '';
    this.gender = '';
    this.file = null;
    this.previewUrl = null;
    this.result = null;
    this.errorMessage = '';
    this.loading = false;

    this.cdr.detectChanges();
  }
}