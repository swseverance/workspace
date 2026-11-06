import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzListModule } from 'ng-zorro-antd/list';
import { Page } from '../page/page';

@Component({
  selector: 'app-dashboard',
  imports: [Page, NzListModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
