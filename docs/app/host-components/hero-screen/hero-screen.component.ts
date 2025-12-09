import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-screen',
  templateUrl: './hero-screen.component.html',
  styles: [],
  standalone: false
})
export class HeroScreenComponent {
  close;
  dispose() {
    this.close();
  }
}
