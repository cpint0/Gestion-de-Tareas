import { ServerRoute, RenderMode } from '@angular/ssr';

// Server-side route list used by the Angular server build to validate
// that client routes are also known on the server. Keep in sync with
// `app.routes.ts`.
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'login', renderMode: RenderMode.Server },
  { path: 'register', renderMode: RenderMode.Server },
  { path: 'tasks', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server }
];
