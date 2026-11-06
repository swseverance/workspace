import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Flashcard, FlashcardType } from '../../models';
import { Flashcards } from '../../services/flashcards';
import { Edit } from '../edit/edit';
import { Page } from '../page/page';

@Component({
  selector: 'app-session',
  imports: [
    Page,
    NzButtonModule,
    NzIconModule,
    RouterLink,
    NzSpinModule,
    NzModalModule,
  ],
  templateUrl: './session.html',
  styleUrl: './session.scss',
})
export class Session implements OnInit {
  private flashcards = inject(Flashcards);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  updating = signal<'reset' | 'increment' | null>(null);
  revealed = signal(false);
  type!: FlashcardType;
  confidence!: number;
  ref: NzModalRef | null = null;
  cards = signal<Flashcard[]>([]);

  get current(): Flashcard | undefined {
    return this.cards()[0];
  }

  constructor() {
    effect(() => {
      if (!this.loading() && this.cards().length === 0) {
        this.router.navigate(['/dashboard/study', this.type]);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.type = this.route.snapshot.paramMap.get('type') as FlashcardType;
    this.confidence = Number(this.route.snapshot.paramMap.get('confidence'));
    this.loading.set(true);

    try {
      this.cards.set(
        await this.flashcards.getFlashcards({
          type: this.type,
          confidence: this.confidence,
        }),
      );
    } catch (error) {
      console.error('getFlashcards()', error);
      this.message.error('Failed to load flashcards');
    } finally {
      this.loading.set(false);
    }
  }

  toggle(): void {
    this.revealed.update((value) => !value);
  }

  openEdit(): void {
    this.ref = this.modal.create({
      nzTitle: 'Edit Flashcard',
      nzContent: Edit,
      nzData: { flashcard: this.current },
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

  openDelete(): void {
    const card = this.current!;

    this.ref = this.modal.confirm({
      nzTitle: 'Delete flashcard?',
      nzContent: `This card will be permanently deleted.`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: () => this.deleteCard(card),
    });

    this.ref.afterClose.subscribe(() => (this.ref = null));
  }

  private async deleteCard(card: Flashcard): Promise<void> {
    try {
      await this.flashcards.deleteFlashcard(card.id);
      this.cards.update((cards) => cards.filter((c) => c.id !== card.id));
      this.message.success('Flashcard deleted');
    } catch (error) {
      console.error('deleteFlashcard()', error);
      this.message.error('Failed to delete flashcard');
      throw error;
    }
  }

  async setConfidence(
    confidence: number,
    action: 'reset' | 'increment',
  ): Promise<void> {
    const card = this.current;
    if (!card || this.updating()) return;

    this.updating.set(action);

    try {
      await this.flashcards.updateFlashcard({
        id: card.id,
        updates: { confidence },
      });
      this.cards.update((cards) => cards.slice(1));
      this.revealed.set(false);
    } catch (error) {
      console.error('updateFlashcard()', error);
      this.message.error('Failed to update flashcard');
    } finally {
      this.updating.set(null);
    }
  }
}
