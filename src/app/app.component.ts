import { Component, OnInit } from '@angular/core';
import { LucideAngularModule, File, HardDrive, Folder } from 'lucide-angular';
import { FileService } from './file.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'file-explorer-angular';
  readonly FileIcon = File;
  readonly HardDriveIcon = HardDrive;
  readonly FolderIcon = Folder;

  drives: any[] = [];
  currentPath: string = '';
  items: any[] = [];
  breadcrumbs: string[] = [];
  systemInfo: any = {};

  constructor(private fileService: FileService) {}

  ngOnInit() {
    this.getSystemInfo();
    this.loadDrives();
  }

  getSystemInfo() {
    this.fileService.getSystemInfo().subscribe(
      (info) => {
        this.systemInfo = info;
        console.log('System Info:', this.systemInfo);
      },
      (error) => console.error('Error getting system info:', error)
    );
  }

  loadDrives() {
    this.fileService.getDrives().subscribe(
      (drives) => {
        this.drives = drives;
        this.items = [];
        this.currentPath = '';
        this.breadcrumbs = [];
      },
      (error) => console.error('Error loading drives:', error)
    );
  }

  navigateTo(path: string) {
    this.currentPath = path;
    this.fileService.listFiles(path).subscribe(
      (items) => {
        this.items = items;
        this.updateBreadcrumbs(path);
      },
      (error) => {
        console.error('Error loading files:', error);
        this.navigateBack();
      }
    );
  }

  updateBreadcrumbs(path: string) {
    if (!path) {
      this.breadcrumbs = [];
      return;
    }
    if (this.systemInfo.os === 'Windows') {
      const parts = path.split(/[/\\]/);
      if (parts[0].endsWith(':') || parts[0].endsWith(':\\')) {
        this.breadcrumbs = [parts[0] + '\\'];
        if (parts.length > 1) {
          this.breadcrumbs.push(...parts.slice(1).filter(Boolean));
        }
      } else {
        this.breadcrumbs = parts.filter(Boolean);
      }
    } else {
      this.breadcrumbs = path.split('/').filter(Boolean);
    }
  }

  formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  }

  navigateBack() {
    if (this.currentPath) {
      if (this.isRoot(this.currentPath)) {
        this.loadDrives();
      } else {
        const parentPath = this.currentPath.split(/[/\\]/).slice(0, -1).join('\\');
        if (parentPath) {
          this.navigateTo(parentPath);
        } else {
          this.loadDrives();
        }
      }
    } else {
      this.loadDrives();
    }
  }

  isRoot(path: string): boolean {
    if (this.systemInfo.os === 'Windows') {
      return path.length <= 3 && path.endsWith(':\\');
    } else {
      return path === '/';
    }
  }

  getBreadcrumbPath(index: number): string {
    if (this.systemInfo.os === 'Windows') {
      if (index === 0 && this.breadcrumbs[0].endsWith(':\\')) {
        return this.breadcrumbs[0];
      }
      return this.breadcrumbs.slice(0, index + 1).join('\\');
    } else {
      return '/' + this.breadcrumbs.slice(0, index + 1).join('/');
    }
  }
}

