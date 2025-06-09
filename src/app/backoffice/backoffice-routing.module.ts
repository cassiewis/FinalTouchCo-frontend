import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './admin-products/admin-products.component';
import { AdminReservationsComponent } from './admin-reservations/admin-reservations.component';
import { LoginComponent } from './login/login.component';
import { AdminReviewsComponent } from './admin-reviews/admin-reviews.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'products', component: AdminProductsComponent },
      { path: 'reservations', component: AdminReservationsComponent },
      { path: 'reviews', component:AdminReviewsComponent },

      { path: '', redirectTo: 'products', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackofficeRoutingModule {}
