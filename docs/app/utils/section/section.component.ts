import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  standalone: false
})
export class SectionComponent implements OnInit {
  @Input()
  heading = '';
  @Input()
  icon = '';
  constructor() {}

  ngOnInit() {}
}
