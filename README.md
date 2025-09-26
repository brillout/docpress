# DocPress

Documentation website builder.

Used for:
- `https://vike.dev`
- `https://telefunc.com`

Don't use this: this package isn't meant for others to use. It's only meant to be used by Vike and Telefunc. That said, feel free to fork this project.

## GitHub Pages Integration

1. Change DNS settings of domain name to add following `A` records:
   ```
   A     @     185.199.108.153
   A     @     185.199.109.153
   A     @     185.199.110.153
   A     @     185.199.111.153
   ```
   See also: [GitHub Docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
1. Add GitHub workflow: [.github/workflows/website.yml](https://github.com/brillout/telefunc/blob/main/.github/workflows/website.yml).
1. Configure `GitHub Settings` > `Pages`

## Algolia DocSearch: Custom Crawler Configs

### [vike.dev](https://vike.dev) / [telefunc.com](https://telefunc.com) template

<details>
<summary>vike-crawler.js</summary>
<div>

```js
new Crawler({
  appId: "YOUR_APP_ID",
  apiKey: "YOUR_API_KEY",
  rateLimit: 8,
  maxDepth: 10,
  startUrls: ["https://vike.dev"],
  renderJavaScript: false,
  sitemaps: [],
  ignoreCanonicalTo: false,
  discoveryPatterns: ["https://vike.dev/**"],
  schedule: "at 13:29 on Tuesday",
  safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 10 } },
  actions: [
    {
      indexName: "YOUR_INDEX_NAME",
      pathsToMatch: ["https://vike.dev/**"],
      recordExtractor: ({ $, helpers, url }) => {
        $("#see-also").next("ul").remove();
        $("#see-also").remove();

        const lvl0 = $('meta[name="algolia:category"]').attr("content").toUpperCase();

        const category_order = Number($('meta[name="algolia:category:order"]').attr("content") || "99999999999");

        const records = helpers.docsearch({
          recordProps: {
            lvl0: { selectors: "", defaultValue: lvl0 },
            lvl1: url.toString() === "https://vike.dev/" ? "head > title" : ".page-content h1",
            lvl2: ".page-content h2",
            lvl3: ".page-content h3",
            lvl4: ".page-content h4",
            lvl5: ".page-content h5",
            lvl6: ".page-content h6",
            content: [".page-content p, .page-content li, .page-content pre"],
            category: { defaultValue: $('meta[name="algolia:category"]').attr("content") || "" },
            pageRank: -1 * category_order,
          },
          indexHeadings: true,
          aggregateContent: true,
          recordVersion: "v3",
        });

        records.forEach((record) => {
          if ( record.content === null && (record.type === "lvl2" || record.type === "lvl3" || record.type === "lvl4")) {
            if (record.anchor) {
              const content =
                $(`#${record.anchor}`).next().text().trim() || null;
              record.content = content;
            }
          }

          record.category_order = category_order;

          record.is_available = Boolean($('meta[name="algolia:category:hide"]').length === 0);
        });

        return records;
      },
    },
  ],
  initialIndexSettings: {
    vike: {
      attributesForFaceting: ["filterOnly(is_available)", "type", "lang"],
      attributesToRetrieve: [
        "hierarchy",
        "content",
        "anchor",
        "url",
        "url_without_anchor",
        "type",
        "category",
        "category_order",
      ],
      attributesToHighlight: ["hierarchy", "content"],
      attributesToSnippet: ["content:10"],
      camelCaseAttributes: ["hierarchy", "content"],
      searchableAttributes: [
        "unordered(hierarchy.lvl1)",
        "unordered(hierarchy.lvl2)",
        "unordered(hierarchy.lvl3)",
        "unordered(hierarchy.lvl4)",
        "content",
      ],
      distinct: true,
      attributeForDistinct: "url",
      customRanking: [
        "asc(category_order)",
        "desc(weight.pageRank)",
        "desc(weight.level)",
        "asc(weight.position)",
      ],
      ranking: [
        "typo",
        "words",
        "filters",
        "attribute",
        "proximity",
        "exact",
        "custom",
      ],
      disableExactOnAttributes: ["hierarchy.lvl2"],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: "</span>",
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: "allOptional",
    },
  },
});
```

</div>
</details>

### diff [default-crawler.js](https://docsearch.algolia.com/docs/templates/#default-template) vike-crawler.js

<details>
<summary>diff default-crawler.js vike-crawler.js</summary>
<div>

```diff
--- a/default-crawler.js
+++ b/vike-crawler.js
 new Crawler({
   appId: "YOUR_APP_ID",
   apiKey: "YOUR_API_KEY",
-  indexPrefix: "crawler_",
   rateLimit: 8,
   maxDepth: 10,
-  startUrls: ["https://YOUR_WEBSITE_URL"],
+  startUrls: ["https://vike.dev"],
   renderJavaScript: false,
   sitemaps: [],
   ignoreCanonicalTo: false,
-  discoveryPatterns: ["https://YOUR_WEBSITE_URL/**"],
+  discoveryPatterns: ["https://vike.dev/**"],
+  schedule: "at 13:29 on Tuesday",
+  safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 10 } },
   actions: [
     {
       indexName: "YOUR_INDEX_NAME",
-      pathsToMatch: ["https://YOUR_WEBSITE_URL/**"],
-      recordExtractor: ({ helpers }) => {
-        return helpers.docsearch({
+      pathsToMatch: ["https://vike.dev/**"],
+      recordExtractor: ({ $, helpers, url }) => {
+        $("#see-also").next("ul").remove();
+        $("#see-also").remove();
+
+        const lvl0 = $('meta[name="algolia:category"]').attr("content").toUpperCase();
+
+        const category_order = Number($('meta[name="algolia:category:order"]').attr("content") || "99999999999");
+
+        const records = helpers.docsearch({
           recordProps: {
-            lvl1: ["header h1", "article h1", "main h1", "h1", "head > title"],
-            content: ["article p, article li", "main p, main li", "p, li"],
-            lvl0: {
-              selectors: "",
-              defaultValue: "Documentation",
-            },
-            lvl2: ["article h2", "main h2", "h2"],
-            lvl3: ["article h3", "main h3", "h3"],
-            lvl4: ["article h4", "main h4", "h4"],
-            lvl5: ["article h5", "main h5", "h5"],
-            lvl6: ["article h6", "main h6", "h6"],
+            lvl0: { selectors: "", defaultValue: lvl0 },
+            lvl1: url.toString() === "https://vike.dev/" ? "head > title" : ".page-content h1",
+            lvl2: ".page-content h2",
+            lvl3: ".page-content h3",
+            lvl4: ".page-content h4",
+            lvl5: ".page-content h5",
+            lvl6: ".page-content h6",
+            content: [".page-content p, .page-content li, .page-content pre"],
+            category: { defaultValue: $('meta[name="algolia:category"]').attr("content") || "" },
+            pageRank: -1 * category_order,
           },
+          indexHeadings: true,
           aggregateContent: true,
           recordVersion: "v3",
         });
+
+        records.forEach((record) => {
+          if ( record.content === null && (record.type === "lvl2" || record.type === "lvl3" || record.type === "lvl4")) {
+            if (record.anchor) {
+              const content =
+                $(`#${record.anchor}`).next().text().trim() || null;
+              record.content = content;
+            }
+          }
+
+          record.category_order = category_order;
+
+          record.is_available = Boolean($('meta[name="algolia:category:hide"]').length === 0);
+        });
+
+        return records;
       },
     },
   ],
   initialIndexSettings: {
-    YOUR_INDEX_NAME: {
-      attributesForFaceting: ["type", "lang"],
+    vike: {
+      attributesForFaceting: ["filterOnly(is_available)", "type", "lang"],
       attributesToRetrieve: [
         "hierarchy",
         "content",
         "url",
         "url_without_anchor",
         "type",
+        "category",
+        "category_order",
       ],
       attributesToHighlight: ["hierarchy", "content"],
       attributesToSnippet: ["content:10"],
-        "unordered(hierarchy.lvl0)",
         "unordered(hierarchy.lvl1)",
         "unordered(hierarchy.lvl2)",
         "unordered(hierarchy.lvl3)",
         "unordered(hierarchy.lvl4)",
-        "unordered(hierarchy.lvl5)",
-        "unordered(hierarchy.lvl6)",
         "content",
       ],
       distinct: true,
       attributeForDistinct: "url",
       customRanking: [
+        "asc(category_order)",
         "desc(weight.pageRank)",
         "desc(weight.level)",
         "asc(weight.position)",
       ],
       ranking: [
+        "typo",
         "words",
         "filters",
-        "typo",
         "attribute",
         "proximity",
         "exact",
         "custom",
       ],
+      disableExactOnAttributes: ["hierarchy.lvl2"],
       highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
       highlightPostTag: "</span>",
-      minWordSizefor1Typo: 3,
-      minWordSizefor2Typos: 7,
       allowTyposOnNumericTokens: false,
       minProximity: 1,
       ignorePlurals: true,
       advancedSyntax: true,
       attributeCriteriaComputedByMinProximity: true,
       removeWordsIfNoResults: "allOptional",
     },
   },
 });
```

</div>
</details>

## Detype

DocPress automatically converts `ts` code blocks to `js` (using [detype](https://github.com/cyco130/detype/)), while showing a JS↔TS toggle to users.

Custom meta and comments:

- Use `ts-only` meta to skip transforming typescript code.
- Use `hide-menu` meta to hide the copy button.
- To transform typescript code with invalid syntax (e.g. for code diffs), use custom magic comments:
  - Use `// @detype-replace dummyVarName varName` above the affected line.
  - Use `// @detype-uncomment ` at the beginning of the affected line.
  
  ```ts
  const hello: string = 'world' // [!code --]
  // @detype-replace dummyhello hello
  const dummyhello: string[] = ['hello', 'world'] // [!code ++]

  // @detype-uncomment function greeting() { // [!code --]
  function greeting(name: string) { // [!code ++]
    // ...
  }
  ```