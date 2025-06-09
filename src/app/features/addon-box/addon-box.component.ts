import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AddOnItem } from '../../models/addOnItem.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-addon-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './addon-box.component.html',
  styleUrl: './addon-box.component.css'
})
export class AddonBoxComponent {
  @Input() addon!: AddOnItem;
  @Input() isSelected: boolean = false;
  @Input() isAvailable: boolean = true;
  @Output() toggle = new EventEmitter<AddOnItem>();

  onToggle() {
    if (this.isAvailable) {
      this.toggle.emit(this.addon);
    }
  }

  // oninit, get item from the service
  // ngOnInit() {
  //   this.addon = this.addonService.getAddon(this.addonId);
  //   if (!this.addon) {
  //     console.error('Addon not found');
  //     return;
  //   }
}
