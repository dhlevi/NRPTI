import { Component, OnInit } from '@angular/core';
import { LoadingScreenService } from 'nrpti-angular-components';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    private loadingScreenService: LoadingScreenService
  ) { }

  ngOnInit() { }

  activateLoading(path) {
    this.loadingScreenService.setLoadingState(true, 'body');
    this.router.navigate(path);
  }
}
