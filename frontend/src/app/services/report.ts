import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private apiUrl = 'https://brain-tumor-detector-3-837n.onrender.com/api/reports';

  constructor(private http: HttpClient) {}

  uploadMRI(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getReports(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}