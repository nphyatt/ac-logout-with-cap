import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication';
import { TeaCategory } from '../models/tea-category';
import { TeaCategoriesService } from '../services/tea-categories';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  categories$: Observable<Array<TeaCategory>>;

  constructor(
    private authentication: AuthenticationService,
    private navController: NavController,
    private teaCategories: TeaCategoriesService
  ) {}

  ngOnInit() {
    this.categories$ = this.teaCategories.getAll();
  }

  logout() {
    this.authentication
      .logout()
      .subscribe(() => this.navController.navigateRoot('/login'));
  }

  editCategory(id: number) {
    this.navController.navigateForward(['edit-tea-category', id]);
  }
}
