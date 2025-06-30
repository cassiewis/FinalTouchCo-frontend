import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lineBreak',
  standalone: true
})
export class LineBreakPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Replace both \n and actual line breaks with <br> tags
    return value
      .replace(/\n/g, '<br>')
      .replace(/\r\n/g, '<br>')
      .replace(/\r/g, '<br>');
  }
}
