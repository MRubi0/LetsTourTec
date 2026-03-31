import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  shareLocation = false;

  ngOnInit() {
    this.shareLocation = localStorage.getItem('ltt_setting_share_location') === 'true';
  }

  onShareLocationChange(value: boolean) {
    this.shareLocation = value;
    localStorage.setItem('ltt_setting_share_location', value ? 'true' : 'false');
  }
}
