import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.geriatriciansguide.com',
  integrations: [
    sitemap({
      /* Keep the noindex thank-you pages out of the sitemap. */
      filter: (page) => !/\/thanks\/?$/.test(page),
      /* Canonical form has no trailing slash (home stays "/"). */
      serialize: (item) => {
        const u = new URL(item.url);
        if (u.pathname !== '/') u.pathname = u.pathname.replace(/\/+$/, '');
        item.url = u.href;
        return item;
      },
    }),
  ],
  /* The assessment used to sit behind an email gate at /is-it-time, with the tool at
     /is-it-time-tool. The tool now lives at /is-it-time, so the old URL (printed in
     The Long Road) forwards to it. */
  redirects: {
    '/is-it-time-tool': '/is-it-time',
    /* The single product page moved from /products to /the-long-road. */
    '/products': '/the-long-road',
  },
});
