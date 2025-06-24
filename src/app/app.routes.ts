import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomepageComponent } from './home/homepage/homepage.component';
import { ShopComponent } from './shop/shop.component';
import { ProductPageComponent } from './features/product-page/product-page.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { LoginComponent } from './backoffice/login/login.component';
import { SuccessPageComponent } from './cart/success-page/success-page.component';
import { ReservationSuccessGuard } from './guards/reservation-success.guard';
import { FaqsComponent } from './home/homepage/faqs/faqs.component';
export const routes: Routes = [
    { path: '', component: HomepageComponent }, // Default route for homepage
    { path: 'home', component: HomepageComponent },
    { path: 'shop', component: ShopComponent },
    { path: 'inspo', loadComponent: () => import('./inspo/inspo.component').then((m) => m.InspoComponent),},
    { path: 'testimonials', loadComponent: () => import('./inspo/inspo.component').then((m) => m.InspoComponent),},
    { path: 'cart', loadComponent: () => import('./cart/cart-page/cart-page.component').then((m) => m.CartComponent),},
    { path: 'reservation-success', component: SuccessPageComponent, canActivate: [ReservationSuccessGuard]},
    { path: 'faqs', component: FaqsComponent },
    { path: 'notFound', component: NotFoundComponent },
    { path: 'product/:productId', component: ProductPageComponent },
    { path: 'login', component: LoginComponent }, // Add the login route
    { path: 'admin', loadChildren: () =>import('./backoffice/backoffice.module').then(m => m.BackofficeModule)},
    { path: '**', component: HomepageComponent }, // Redirect any incorrect URLs to home
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
