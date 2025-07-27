import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomepageComponent } from './home/homepage/homepage.component';
import { ShopComponent } from './shop/shop.component';
import { ProductPageComponent } from './features/product-page/product-page.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { LoginComponent } from './backoffice/login/login.component';
import { SuccessPageComponent } from './cart/success-page/success-page.component';
import { ReservationSuccessGuard } from './guards/reservation-success.guard';
import { ConstructionGuard } from './guards/construction.guard';
import { FaqsComponent } from './home/homepage/faqs/faqs.component';
import { UnderConstructionComponent } from './under-construction/under-construction.component';
import { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';
export const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/home', // Back to your original home redirect
        pathMatch: 'full'
    },
    { 
        path: 'construction', 
        component: UnderConstructionComponent 
    },
    { path: 'home', component: HomepageComponent, canActivate: [ConstructionGuard] },
    { path: 'shop', component: ShopComponent, canActivate: [ConstructionGuard] },
    { path: 'inspo', loadComponent: () => import('./inspo/inspo-gallery').then((m) => m.InspoGalleryComponent), canActivate: [ConstructionGuard] },
    { path: 'testimonials', loadComponent: () => import('./testimonials/testimonials.component').then((m) => m.TestimonialsComponent), canActivate: [ConstructionGuard] },
    { path: 'cart', loadComponent: () => import('./cart/cart-page/cart-page.component').then((m) => m.CartComponent), canActivate: [ConstructionGuard] },
    { path: 'reservation-success', component: SuccessPageComponent, canActivate: [ReservationSuccessGuard, ConstructionGuard]},
    { path: 'faqs', component: FaqsComponent, canActivate: [ConstructionGuard] },
    { path: 'notFound', component: NotFoundComponent },
    { path: 'product/:productId', component: ProductPageComponent, canActivate: [ConstructionGuard] },
    { path: 'login', component: LoginComponent }, // Admin routes stay accessible
    { path: 'admin', loadChildren: () =>import('./backoffice/backoffice.module').then(m => m.BackofficeModule)}, // Admin routes stay accessible
    { path: 'privacy-policy', component: PrivacyPolicyComponent, canActivate: [ConstructionGuard] },
    { path: '**', redirectTo: '/home' }, // Back to your original behavior
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
