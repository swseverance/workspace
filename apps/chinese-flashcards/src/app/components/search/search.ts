import { ScrollingModule } from '@angular/cdk/scrolling';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Logger } from '@org/logger';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { finalize } from 'rxjs';
import { Flashcard } from '../../models';
import { Flashcards } from '../../services/flashcards';
import { Edit } from '../edit/edit';
import { Page } from '../page/page';

@Component({
  selector: 'app-search',
  imports: [
    Page,
    NzButtonModule,
    NzIconModule,
    RouterLink,
    FormsModule,
    NzInputModule,
    ScrollingModule,
    NzListModule,
    NzSpinModule,
    NzEmptyModule,
    NzModalModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit {
  private flashcards = inject(Flashcards);
  private message = inject(NzMessageService);
  private logger = inject(Logger);
  private modal = inject(NzModalService);

  loading = signal(false);
  query = signal('');
  cards = signal<Flashcard[]>([]);
  ref: NzModalRef | null = null;

  results = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) return this.cards();
    return this.cards().filter((card) => card.search.startsWith(query));
  });

  trackById(_index: number, card: Flashcard): string {
    return card.id;
  }

  ngOnInit(): void {
    this.loading.set(true);

    this.flashcards
      .getFlashcards({})
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (value) => this.cards.set(value),
        error: (error: unknown) => {
          this.logger.error('[search] load failed', error);
          this.message.error('Failed to load flashcards');
        },
      });
  }

  openEdit(card: Flashcard): void {
    this.ref = this.modal.create({
      nzTitle: 'Edit Flashcard',
      nzContent: Edit,
      nzData: { flashcard: card },
      nzFooter: null,
    });

    this.ref.afterClose.subscribe((updated?: Flashcard) => {
      this.ref = null;

      if (updated) {
        this.cards.update((cards) =>
          cards.map((c) => (c.id === updated.id ? updated : c)),
        );
      }
    });
  }

  openDelete(card: Flashcard): void {
    this.ref = this.modal.confirm({
      nzTitle: 'Delete flashcard?',
      nzContent: `This flashcard will be permanently deleted.`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: () => this.deleteCard(card),
    });

    this.ref.afterClose.subscribe(() => {
      this.ref = null;
    });
  }

  private async deleteCard(card: Flashcard): Promise<void> {
    try {
      await this.flashcards.deleteFlashcard(card.id);
      this.cards.update((cards) => cards.filter((c) => c.id !== card.id));
      this.message.success('Flashcard deleted');
    } catch (error) {
      this.logger.error('[search] deleteFlashcard failed', error);
      this.message.error('Failed to delete flashcard');
      throw error;
    }
  }
}
