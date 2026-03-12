import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  slides = [0, 1, 2, 3, 4];
  currentSlide = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  goToSlide(index: number): void {
    this.currentSlide = (index + this.slides.length) % this.slides.length;
    this.resetTimer();
  }

  changeSlide(direction: number): void {
    this.goToSlide(this.currentSlide + direction);
  }

  private startTimer(): void {
    this.timer = setInterval(() => this.changeSlide(1), 4000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private resetTimer(): void {
    this.stopTimer();
    this.startTimer();
  }
}
