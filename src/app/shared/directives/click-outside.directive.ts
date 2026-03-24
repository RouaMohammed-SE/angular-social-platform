import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Input() appClickOutsideEnabled = true;
  @Input() appClickOutsideCloseOnEscape = false;
  @Output() appClickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.appClickOutsideEnabled) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(target)) {
      this.appClickOutside.emit();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscapeKey(): void {
    if (!this.appClickOutsideEnabled || !this.appClickOutsideCloseOnEscape) {
      return;
    }

    this.appClickOutside.emit();
  }
}
