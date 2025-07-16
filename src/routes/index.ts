import AddTaskIcon from '@mui/icons-material/AddTask';
import BugReportIcon from '@mui/icons-material/BugReport';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import TerrainIcon from '@mui/icons-material/Terrain';
import ListIcon from '@mui/icons-material/List';

import asyncComponentLoader from '@/utils/loader';

import { Pages, Routes } from './types';

const routes: Routes = {
  [Pages.Welcome]: {
    component: asyncComponentLoader(() => import('@/pages/Home')),
    path: '/',
    title: 'Home',
    icon: HomeIcon,
  },
  [Pages.CreatePaste]: {
    component: asyncComponentLoader(() => import('@/pages/CreatePaste')),
    path: '/create-paste',
    title: 'Create Paste',
    icon: GitHubIcon,
  },
  [Pages.GetPaste]: {
    component: asyncComponentLoader(() => import('@/pages/GetPaste')),
    path: '/get-paste',
    title: 'Get Paste',
    icon: AddTaskIcon,
  },
  [Pages.Page3]: {
    component: asyncComponentLoader(() => import('@/pages/Page3')),
    path: '/all-pastes',
    title: 'All Pastes',
    icon: ListIcon,
  },
  [Pages.Page4]: {
    component: asyncComponentLoader(() => import('@/pages/Page4')),
    path: '/page-4',
    title: 'Page 4',
    icon: BugReportIcon,
  },
  [Pages.NotFound]: {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
  // [Pages.Page3]: {
  //   component: asyncComponentLoader(() => import('@/pages/Page3')),
  //   path: '/page-3',
  //   title: 'Page 3',
  //   icon: TerrainIcon,
  // },
  // [Pages.Page4]: {
  //   component: asyncComponentLoader(() => import('@/pages/Page4')),
  //   path: '/page-4',
  //   title: 'Page 4',
  //   icon: BugReportIcon,
  // },
  // [Pages.NotFound]: {
  //   component: asyncComponentLoader(() => import('@/pages/NotFound')),
  //   path: '*',
  // },
};

export default routes;
