import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ENVIRONMENT } from '@org/environment';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly environment = inject(ENVIRONMENT);
}
