import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconSpriteComponent } from './shared/components/icon-sprite/icon-sprite.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IconSpriteComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
