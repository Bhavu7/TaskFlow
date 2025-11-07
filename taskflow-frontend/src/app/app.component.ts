import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `
  <router-outlet></router-outlet>
  <app-toast></app-toast>
  `,
  styles: []
})
export class AppComponent {
  title = 'TaskFlow';
}