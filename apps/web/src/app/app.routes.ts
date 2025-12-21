import { Routes } from '@angular/router';
import { Products } from '../features/products/products';
import { Admin } from '../features/admin/admin';
import { landingPage } from '../features/landing-page/landing-page';
import { Home } from '../features/home/home';
import { Login } from '../features/login/login';

export const routes: Routes = [
    {
        path: '', // Landing page
        component: landingPage,
    },
    {
        path: 'home', // Home/dashboard page
        component: Home,
    },
    {
        path: 'products', // Product listing page
        component: Products,
    },
    {
        path: 'product/:id', // Product detail page
        loadComponent: () => import('../features/product-overview/product-overview').then(m => m.ProductOverview)
    },
    {
        path: 'cart', // Shopping cart page
        loadComponent: () => import('../features/cart/cart').then(m => m.Cart)
    },
    {
        path: 'checkout', // Checkout page
        loadComponent: () => import('../features/checkout/checkout').then(m => m.Checkout)
    },
    {
        path: 'order-confirmation/:orderId', // Order confirmation page
        loadComponent: () => import('../features/order/order').then(m => m.Order)
    },
    {
        path: 'profile', // User profile and order history
        loadComponent: () => import('../features/profile/profile').then(m => m.Profile)
    },
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'admin',
        component: Admin,
    }
    // Additional routes can be added here 
    // { path: 'about', component: About }, etc.

];