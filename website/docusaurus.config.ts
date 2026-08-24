import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
// The Tailwind v4 PostCSS plugin. Pushed into Docusaurus' PostCSS pipeline
// below so utility classes used by the chrome are generated at build time.
import tailwindcss from '@tailwindcss/postcss';

const config: Config = {
  title: 'ORD Overlay Editor',
  tagline: 'View and edit ORD Overlay documents',
  favicon: 'img/favicon.ico',
  storage: { namespace: true },

  url: 'https://open-resource-discovery.github.io',
  // Overridable for PR previews; trailing slash is required by Docusaurus.
  baseUrl: process.env.BASE_URL || '/overlay-editor/',
  organizationName: 'open-resource-discovery',
  projectName: 'overlay-editor',

  onBrokenLinks: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'warn' } },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // ui-components' stylesheet is a JS-side-effect import, so it lives in a
  // client module rather than `theme.customCss` (which only takes CSS files).
  clientModules: ['./clientModules/ordUi.ts'],

  plugins: [
    // Wire Tailwind v4 into Docusaurus' PostCSS pipeline. Utilities are imported
    // unlayered in custom.css, so class specificity wins over Infima's element
    // selectors without depending on cascade-layer support.
    function tailwindPlugin() {
      return {
        name: 'tailwind-plugin',
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(tailwindcss);
          return postcssOptions;
        },
      };
    },
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'ORD Overlay Editor',
      items: [
        { to: '/', label: 'Home', position: 'left', activeBasePath: '/' },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        { to: '/playground', label: 'Playground', position: 'left' },
        {
          href: 'https://github.com/open-resource-discovery/overlay-editor',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    ...(process.env.PR_PREVIEW_NUMBER
      ? {
          announcementBar: {
            content: `<b>This is a preview build of the website for <a href="https://github.com/open-resource-discovery/overlay-editor/pull/${process.env.PR_PREVIEW_NUMBER}" target="_blank">PR #${process.env.PR_PREVIEW_NUMBER}</a></b>`,
            backgroundColor: '#0078d4',
            textColor: '#ffffff',
            isCloseable: false,
          },
        }
      : {}),
  } satisfies Preset.ThemeConfig,
};

export default config;
