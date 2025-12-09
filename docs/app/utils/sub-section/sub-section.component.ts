import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub-section',
  templateUrl: './sub-section.component.html',
  styles: [],
  standalone: false
})
export class SubSectionComponent implements OnInit {
  @Input()
  heading;
  constructor() {}

  ngOnInit() {}
}
