import { defineStackbitConfig, SiteMapEntry } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';

export default defineStackbitConfig({
  stackbitVersion: '~0.6.0',
  ssgName: 'custom',
  nodeVersion: '18',

  contentSources: [
    new GitContentSource({
      rootPath: __dirname,
      contentDirs: ['content/articles'],
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
      ],
    }),
  ],

  siteMap: ({ documents }): SiteMapEntry[] =>
    documents
      .filter((doc) => doc.modelName === 'Article')
      .map((doc) => ({
        stableId:  doc.id,
        urlPath:   `/article_view/code.html?slug=${doc.id}`,
        document:  doc,
        isHomePage: false,
      })),
});
