import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { VerifyProfileComponent } from './components/verify-profile/verify-profile.component';
import { LiveShowComponent } from './components/live-show/live-show.component';
import { LiveSkitComponent } from './components/live-skit/live-skit.component';
import { CheckboxEpisodeComponent } from './components/checkbox-episode/checkbox-episode.component';
import { SharedModule } from '@frontend/shared';
import { ToastrModule } from 'ngx-toastr';
import {
  APP_CONFIG,
  HttpAuthInterceptService,
  ToastComponent,
} from '@frontend/app-config';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';
import { VerificationGuard } from './guards/verification.guard';
import { CommonComponentModule } from './modules/common-component/common-component.module';
import { ArtistStoreModule } from '@frontend/artist-store';
import { RoleGuard } from './guards/role.guard';
import { HelpsComponent } from './components/helps/helps.component';
import { LiveComponent } from './components/live/live.component';
import { LiveShowChatComponent } from './components/live-show-chat/live-show-chat.component';
import { LiveShowExpendedComponent } from './components/live-show-expended/live-show-expended.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () =>
      import('@frontend/auth').then((module) => module.AuthModule),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'setup',
    loadChildren: () =>
      import('./modules/setup/setup.module').then(
        (module) => module.SetupModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then(
        (module) => module.DashboardModule
      ),
    canActivate: [AuthGuard, VerificationGuard],
  },
  {
    path: 'podcast',
    loadChildren: () =>
      import('./modules/podcast/podcast.module').then(
        (module) => module.PodcastModule
      ),
    canActivate: [AuthGuard, VerificationGuard, RoleGuard],
    data: { roles: ['podcasters'] },
  },
  {
    path: 'skits',
    loadChildren: () =>
      import('./modules/skits/skits.module').then(
        (module) => module.SkitsModule
      ),
    canActivate: [AuthGuard, VerificationGuard, RoleGuard],
    data: { roles: ['comedians'] },
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./modules/profile/profile.module').then(
        (module) => module.ProfileModule
      ),
    canActivate: [AuthGuard, VerificationGuard],
  },
  {
    path: 'finance',
    loadChildren: () =>
      import('./modules/finance/finance.module').then(
        (module) => module.FinanceModule
      ),
    canActivate: [AuthGuard, VerificationGuard],
  },
  {
    path: 'music',
    loadChildren: () =>
      import('./modules/music/music.module').then(
        (module) => module.MusicModule
      ),
    canActivate: [AuthGuard, VerificationGuard, RoleGuard],
    data: { roles: ['musicians'] },
  },
  { path: 'verify-profile', component: VerifyProfileComponent },
  { path: 'live-show', component: LiveShowComponent },
  { path: 'live-skit', component: LiveSkitComponent },
  { path: 'checkbox-episode', component: CheckboxEpisodeComponent },
  { path: 'help', component: HelpsComponent },
  { path: 'live', component: LiveComponent },
  { path: 'live-show-chat', component: LiveShowChatComponent },
  { path: 'live-show-expended', component: LiveShowExpendedComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    VerifyProfileComponent,
    LiveShowComponent,
    LiveSkitComponent,
    CheckboxEpisodeComponent,
    ToastComponent,
    HelpsComponent,
    LiveComponent,
    LiveShowChatComponent,
    LiveShowExpendedComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' }),
    ToastrModule.forRoot({
      closeButton: true,
      maxOpened: 2,
      autoDismiss: true,
      preventDuplicates: true,
      positionClass: 'toast-top-full-width',
      toastComponent: ToastComponent,
      toastClass: 'ngx-toastr custom-toast',
    }),
    HttpClientModule,
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    CommonComponentModule,
    ArtistStoreModule,
  ],
  providers: [
    { provide: APP_CONFIG, useValue: environment },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAuthInterceptService,
      multi: true,
    },
    BsModalService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
