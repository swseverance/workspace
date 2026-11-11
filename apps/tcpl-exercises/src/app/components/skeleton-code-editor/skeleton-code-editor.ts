import { Component } from '@angular/core';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

@Component({
  selector: 'app-skeleton-code-editor',
  imports: [NzSkeletonModule],
  templateUrl: './skeleton-code-editor.html',
  styleUrl: './skeleton-code-editor.scss',
})
export class SkeletonCodeEditor {}
