import { Routes } from '@angular/router';
import { Products } from '../features/products/products';
import { Admin } from '../features/admin/admin';
import { landingPage } from '../features/landing-page/landing-page';
import { Home } from '../features/home/home';
import { Login } from '../features/login/login';

export const routes: Routes = [
    {
        path: '',
        component: landingPage,
    },
    {
        path: 'home',
        component: Home,
    },
    {
        path: 'products',
        component: Products,
    },
    {
        path: 'product/:id',  // Product detail page
        loadComponent: () => import('../features/product-overview/product-overview').then(m => m.ProductOverview)
    },
    {
        path: 'cart',  // Shopping cart
        loadComponent: () => import('../features/cart/cart').then(m => m.Cart)
    },
    {
        path: 'checkout',  // Checkout page
        loadComponent: () => import('../features/checkout/checkout').then(m => m.Checkout)
    },
    {
        path: 'order/:orderId',  // Order confirmation page
        loadComponent: () => import('../features/order/order').then(m => m.Order)
    },
    {
        path: 'profile',  // User profile
        loadComponent: () => import('../features/profile/profile').then(m => m.Profile)
    },
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'admin',
        component: Admin,
     },
    // {
    //     path: '**',  // 404 - Not Found
    //     loadComponent: () => import('../features/not-found/not-found').then(m => m.NotFound)
    // }
];