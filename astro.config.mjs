import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.geriatriciansguide.com',
  /* The assessment used to sit behind an email gate at /is-it-time, with the tool at
     /is-it-time-tool. The tool now lives at /is-it-time, so the old URL (printed in
     The Long Road) forwards to it. */
  redirects: {
    '/is-it-time-tool': '/is-it-time',
    /* The single product page moved from /products to /the-long-road. */
    '/products': '/the-long-road',
  },
});
