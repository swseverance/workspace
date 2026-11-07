import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ReactionType } from '../../../models/github';
import { GHReactionsRow } from '../../../models/table';

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: ReactionType.ThumbsUp, emoji: '👍' },
  { type: ReactionType.ThumbsDown, emoji: '👎' },
  { type: ReactionType.Laugh, emoji: '😄' },
  { type: ReactionType.Hooray, emoji: '🎉' },
  { type: ReactionType.Confused, emoji: '😕' },
  { type: ReactionType.Heart, emoji: '❤️' },
  { type: ReactionType.Rocket, emoji: '🚀' },
  { type: ReactionType.Eyes, emoji: '👀' },
];

@Component({
  selector: 'app-mobile-card',
  imports: [DatePipe, NzDescriptionsModule, NzTagModule],
  templateUrl: './mobile-card.html',
  styleUrl: './mobile-card.scss',
})
export class MobileCard implements ICellRendererAngularComp {
  row: GHReactionsRow | null = null;
  reactions: { emoji: string; count: number }[] = [];

  agInit(params: ICellRendererParams<GHReactionsRow>): void {
    if (params.data) this.setRow(params.data);
  }

  refresh(params: ICellRendererParams<GHReactionsRow>): boolean {
    if (params.data) this.setRow(params.data);
    return true;
  }

  private setRow(data: GHReactionsRow): void {
    this.row = data;
    this.reactions = REACTIONS.filter(
      ({ type }) => (data.reactions[type] ?? 0) > 0,
    ).map(({ type, emoji }) => ({ emoji, count: data.reactions[type]! }));
  }
}
