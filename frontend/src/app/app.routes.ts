import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Upload} from './pages/upload/upload';
import { Reports } from './pages/reports/reports';
import { About } from './pages/about/about';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'upload', component: Upload },
  { path: 'reports', component: Reports },
  { path: 'about', component: About},
];