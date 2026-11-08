import { Component, inject, signal } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Logger } from '@org/logger';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  NZ_MODAL_DATA,
  NzModalModule,
  NzModalRef,
  NzModalService,
} from 'ng-zorro-antd/modal';
import { firstValueFrom } from 'rxjs';
import { Weights } from '../../services/weights';

@Component({
  selector: 'app-weight-form',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzModalModule,
  ],
  templateUrl: './weight-form.html',
  styleUrl: './weight-form.scss',
})
export class WeightForm {
  private weights = inject(Weights);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private modalRef = inject(NzModalRef);
  private data = inject<{ date: string; weight: number | null }>(NZ_MODAL_DATA);
  private fb = inject(NonNullableFormBuilder);
  private logger = inject(Logger);

  isEditing = this.data.weight !== null;
  loading = signal(false);

  form = this.fb.group({
    weight: [this.data.weight, [Validators.required, Validators.min(1)]],
  });

  cancel(): void {
    this.modalRef.destroy();
  }

  onDelete(): void {
    this.modal.confirm({
      nzTitle: 'Delete this entry?',
      nzContent: `This will permanently delete the weight entry for ${this.data.date}.`,
      nzOkText: 'Delete',
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await firstValueFrom(this.weights.deleteEntry(this.data.date));

          this.modalRef.destroy({ deleted: true });

          this.message.success('Weight deleted');
        } catch (error) {
          this.logger.error('[weight-form] deleteEntry failed', error);

          this.message.error('Failed to delete weight');

          throw error;
        }
      },
    });
  }

  async onSubmit(): Promise<void> {
    this.loading.set(true);

    try {
      const { weight } = this.form.getRawValue();
      const entry = await firstValueFrom(
        this.weights.upsertEntry(this.data.date, weight!),
      );

      this.modalRef.destroy(entry);

      this.message.success('Weight saved');
    } catch (error) {
      this.logger.error('[weight-form] upsertEntry failed', error);

      this.message.error('Failed to save weight');
    } finally {
      this.loading.set(false);
    }
  }
}
