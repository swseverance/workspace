import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NzButtonModule],
  host: { style: 'display: block; padding: 16px;' },
  template: `<a nz-button nzType="primary" routerLink="/exercises"
    >Begin the exercises</a
  >`,
})
export class Home {}
