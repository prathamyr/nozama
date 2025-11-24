import { Routes } from '@angular/router';
import { Product } from '../product/product';
import { Admin } from '../admin/admin';
import { Home } from '../home/home';
import { Login } from '../login/login';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },
    {
        path: 'product',
        component: Product,
    },
    {
        path: 'admin',
        component: Admin,
    },
    {
        path: 'login',
        component: Login,
    }
];
