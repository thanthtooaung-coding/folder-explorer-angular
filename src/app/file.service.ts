import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  getSystemInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/system-info`);
  }

  getDrives(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/drives`);
  }

  listFiles(path: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files`, { params: { path } });
  }
}