import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AnalyticsFacade } from '../../store/analytics/analytics.facade';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, DecimalPipe, RouterLink, NzButtonModule, NzCardModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly facade = inject(AnalyticsFacade);

  protected readonly analytics$ = this.facade.analytics$;

  // During hydration this is answered synchronously from the transfer
  // cache, so the stats in the server-rendered page don't flicker.
  ngOnInit(): void {
    this.facade.loadAnalytics();
  }
}
