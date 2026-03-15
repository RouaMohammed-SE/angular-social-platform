import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { FeedComponent } from './features/feed/feed.component';
import { ProfileComponent } from './features/profile/profile.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { authGuard } from './core/guards/auth/auth-guard';
import { guestGuard } from './core/guards/guest/guest-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        component: LoginComponent,
        title: 'Sign In | Route Posts',
      },
      { path: 'register', component: RegisterComponent, title: 'Create Account | Route Posts' },
    ],
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'feed',
        component: FeedComponent,
        title: 'Home Feed | Route Posts',
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Profile | Route Posts',
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
        title: 'Notifications | Route Posts',
      },
      {
        path: 'changePassword',
        component: ChangePasswordComponent,
        title: 'Change Password | Route Posts',
      },
    ],
  },

  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page Not Found | Route Posts',
  },
];
