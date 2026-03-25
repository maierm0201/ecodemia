import { defineStackbitConfig, SiteMapEntry } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'custom',
  nodeVersion: '18',

  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ['content/articles', 'content/pages'],
      models: [
        {
          name: 'Article',
          type: 'page',
          urlPath: '/article_view/code.html?slug={slug}',
          filePath: 'content/articles/{slug}.md',
          fields: [
            { name: 'title',       type: 'string',   required: true },
            { name: 'date',        type: 'string',   required: false },
            { name: 'category',    type: 'enum',     required: false,
              options: ['climate', 'wildlife', 'energy', 'living', 'tech', 'policy', 'live'] },
            { name: 'cover_image', type: 'image',    required: false },
            { name: 'excerpt',     type: 'text',     required: false },
            { name: 'body',        type: 'markdown', required: false },
          ],
        },
        {
          name: 'Homepage',
          type: 'page',
          urlPath: '/environmental_news_homepage/code.html',
          filePath: 'content/pages/homepage.md',
          fields: [
            { name: 'title',              type: 'string', required: false },
            // Hero
            { name: 'hero_image',         type: 'image',  required: false },
            { name: 'hero_title',         type: 'string', required: false },
            { name: 'hero_excerpt',       type: 'text',   required: false },
            { name: 'hero_author',        type: 'string', required: false },
            { name: 'hero_author_role',   type: 'string', required: false },
            // Latest News
            { name: 'latest_heading',     type: 'string', required: false },
            { name: 'latest_1_time',      type: 'string', required: false },
            { name: 'latest_1_title',     type: 'string', required: false },
            { name: 'latest_2_time',      type: 'string', required: false },
            { name: 'latest_2_title',     type: 'string', required: false },
            { name: 'latest_3_time',      type: 'string', required: false },
            { name: 'latest_3_title',     type: 'string', required: false },
            { name: 'latest_4_time',      type: 'string', required: false },
            { name: 'latest_4_title',     type: 'string', required: false },
            // In-Depth Reporting
            { name: 'indepth_heading',    type: 'string', required: false },
            { name: 'card1_label',        type: 'string', required: false },
            { name: 'card1_title',        type: 'string', required: false },
            { name: 'card1_excerpt',      type: 'text',   required: false },
            { name: 'card1_cta',          type: 'string', required: false },
            { name: 'card2_label',        type: 'string', required: false },
            { name: 'card2_title',        type: 'string', required: false },
            { name: 'card2_excerpt',      type: 'text',   required: false },
            { name: 'card2_cta',          type: 'string', required: false },
            { name: 'stats_label',        type: 'string', required: false },
            { name: 'stats_number',       type: 'string', required: false },
            { name: 'stats_unit',         type: 'string', required: false },
            { name: 'stats_quote',        type: 'text',   required: false },
            { name: 'stats_attribution',  type: 'string', required: false },
            // Support Banner
            { name: 'support_eyebrow',    type: 'string', required: false },
            { name: 'support_heading',    type: 'string', required: false },
            { name: 'support_body',       type: 'text',   required: false },
            { name: 'support_cta',        type: 'string', required: false },
            { name: 'support_note',       type: 'string', required: false },
            // Newsletter
            { name: 'newsletter_heading', type: 'string', required: false },
            { name: 'newsletter_body',    type: 'text',   required: false },
            { name: 'newsletter_cta',     type: 'string', required: false },
            // Footer
            { name: 'footer_about',       type: 'text',   required: false },
          ],
        },
      ],
    }),
  ],

  siteMap: ({ documents }): SiteMapEntry[] => [
    ...documents
      .filter((doc) => doc.modelName === 'Article')
      .map((doc) => ({
        stableId:   doc.id,
        urlPath:    `/article_view/code.html?slug=${doc.id}`,
        document:   doc,
        isHomePage: false,
      })),
    ...documents
      .filter((doc) => doc.modelName === 'Homepage')
      .map((doc) => ({
        stableId:   doc.id,
        urlPath:    '/environmental_news_homepage/code.html',
        document:   doc,
        isHomePage: true,
      })),
  ],
});
