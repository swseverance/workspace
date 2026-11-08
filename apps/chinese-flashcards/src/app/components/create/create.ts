import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Logger } from '@org/logger';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FlashcardType } from '../../models';
import { Flashcards } from '../../services/flashcards';
import { Page } from '../page/page';

@Component({
  selector: 'app-create',
  imports: [
    Page,
    NzButtonModule,
    NzIconModule,
    RouterLink,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzRadioModule,
    NzSpinModule,
  ],
  templateUrl: './create.html',
  styleUrl: './create.scss',
})
export class Create {
  private flashcards = inject(Flashcards);
  private message = inject(NzMessageService);
  private logger = inject(Logger);
  private fb = inject(NonNullableFormBuilder);

  form = this.fb.group({
    chinese: ['', Validators.required],
    pinyin: [''],
    translation: [''],
    notes: [''],
    type: [FlashcardType.WORD],
  });

  FlashcardType = FlashcardType;

  loading = signal(false);

  async onSubmit() {
    this.loading.set(true);

    const { chinese, pinyin, translation, notes, type } =
      this.form.getRawValue();

    try {
      await this.flashcards.addFlashcard({
        chinese: chinese.trim(),
        pinyin: pinyin.trim(),
        translation: translation.trim(),
        notes: notes.trim(),
        type,
      });

      this.message.success('Flashcard created');

      this.form.reset({
        chinese: '',
        pinyin: '',
        translation: '',
        notes: '',
        type: FlashcardType.WORD,
      });
    } catch (error) {
      this.message.error('Failed to create flashcard');

      this.logger.error('[create] addFlashcard failed', error);
    } finally {
      this.loading.set(false);
    }
  }
}
