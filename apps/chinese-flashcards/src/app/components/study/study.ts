import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Logger } from '@org/logger';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { finalize } from 'rxjs';
import { FlashcardType } from '../../models';
import { Flashcards } from '../../services/flashcards';
import { Page } from '../page/page';

@Component({
  selector: 'app-study',
  imports: [
    Page,
    NzButtonModule,
    NzIconModule,
    RouterLink,
    NzListModule,
    NzBadgeModule,
    NzSpinModule,
    NzEmptyModule,
  ],
  templateUrl: './study.html',
  styleUrl: './study.scss',
})
export class Study implements OnInit {
  private flashcards = inject(Flashcards);
  private message = inject(NzMessageService);
  private logger = inject(Logger);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  type!: FlashcardType;
  groups = signal<Array<{ confidence: number; count: number }>>([]);

  ngOnInit(): void {
    this.type = this.route.snapshot.paramMap.get('type') as FlashcardType;
    this.loading.set(true);

    this.flashcards
      .getGroups(this.type)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (value) => this.groups.set(value),
        error: (error: unknown) => {
          this.logger.error('[study] load failed', error);
          this.message.error('Failed to load flashcards');
        },
      });
  }
}
