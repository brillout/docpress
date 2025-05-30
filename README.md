Documentation website builder.

Used for:
- `https://vike.dev`
- `https://telefunc.com`

Don't use this: this package isn't meant for others to use. It's only meant to be used by Vike and Telefunc. That said, feel free to fork this project.

# Algolia DocSearch: Custom Crawler Configs

## [vike.dev](https://vike.dev) template

<details>
<summary>vike.dev-crawler.js</summary>
<div>

```js
new Crawler({
    appId: "APP_ID",
    apiKey: "API_KEY",
    rateLimit: 8,
    maxDepth: 10,
    startUrls: ["https://vike.dev/"],
    renderJavaScript: false,
    sitemaps: [],
    discoveryPatterns: ["https://vike.dev/**"],
    schedule: "at 13:29 on Tuesday",
    actions: [
        {
            indexName: "vike",
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
                    if (!record.hierarchy.lvl1) {
                        record.hierarchy.lvl1 = $("title").text().replace(" | Vike", "");
                    }
                    if (record.content === null && (record.type === "lvl2" || record.type === "lvl3" || record.type === "lvl4")) {
                        if (record.anchor) {
                            const content = $(`#${record.anchor}`).next().text().trim() || null;
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
            advancedSyntax: true,
            allowTyposOnNumericTokens: false,
            attributeCriteriaComputedByMinProximity: true,
            attributeForDistinct: "url",
            attributesForFaceting: [ "type", "lang", "is_available", "category_order", "type" ],
            attributesToHighlight: [ "content", "content_camel", "hierarchy", "hierarchy.lvl0" ],
            attributesToRetrieve: [
                "anchor",
                "content",
                "hierarchy",
                "category_order",
                "type",
                "url",
                "url_without_anchor",
            ],
            attributesToSnippet: ["content:10"],
            camelCaseAttributes: ["hierarchy", "content"],
            customRanking: [
                "asc(category_order)",
                "desc(weight.pageRank)",
                "desc(weight.level)",
                "asc(weight.position)",
            ],
            distinct: 1,
            highlightPostTag: "</span>",
            highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
            ignorePlurals: true,
            minProximity: 1,
            minWordSizefor1Typo: 3,
            minWordSizefor2Typos: 7,
            ranking: [
                "words",
                "filters",
                "typo",
                "attribute",
                "proximity",
                "exact",
                "custom",
            ],
            removeWordsIfNoResults: "allOptional",
            searchableAttributes: [
                "unordered(hierarchy.lvl0)",
                "unordered(hierarchy.lvl1)",
                "unordered(hierarchy.lvl2)",
                "unordered(hierarchy.lvl3)",
                "unordered(hierarchy.lvl4)",
                "content",
            ],
        },
    },
    ignoreCanonicalTo: false,
    safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 10 } },
});
```

</div>
</details>

## [telefunc.com](https://telefunc.com) template

<details>
<summary>telefunc.com-crawler.js</summary>
<div>

```js
new Crawler({
    appId: "APP_ID",
    apiKey: "API_KEY",
    indexPrefix: "",
    rateLimit: 8,
    renderJavaScript: false,
    startUrls: ["https://telefunc.com"],
    discoveryPatterns: ["https://telefunc.com/**"],
    schedule: "at 15:03 on Monday",
    maxDepth: 10,
    actions: [
        {
            indexName: "telefunc",
            pathsToMatch: ["https://telefunc.com/**"],
            recordExtractor: ({ $, helpers, url }) => {
                $("#see-also").next("ul").remove();
                $("#see-also").remove();

                const lvl0 = $('meta[name="algolia:category"]').attr("content").toUpperCase();

                const category_order = Number($('meta[name="algolia:category:order"]').attr("content") || "99999999999");

                const records = helpers.docsearch({
                    recordProps: {
                        lvl0: { selectors: "", defaultValue: lvl0 },
                        lvl1: url.toString() === "https://telefunc.com/" ? "head > title" : ".page-content h1",
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
                    if (!record.hierarchy.lvl1) {
                        record.hierarchy.lvl1 = $("title").text().replace(" | Telefunc", "");
                    }
                    if (record.content === null && (record.type === "lvl2" || record.type === "lvl3" || record.type === "lvl4")) {
                        if (record.anchor) {
                            const content = $(`#${record.anchor}`).next().text().trim() || null;
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
            advancedSyntax: true,
            allowTyposOnNumericTokens: false,
            attributeCriteriaComputedByMinProximity: true,
            attributeForDistinct: "url",
            attributesForFaceting: ["type", "lang"],
            attributesToHighlight: ["content"],
            attributesToRetrieve: ["hierarchy", "content", "anchor", "url"],
            attributesToSnippet: ["content:10"],
            camelCaseAttributes: ["hierarchy", "content"],
            customRanking: [
                "desc(weight.pageRank)",
                "desc(weight.level)",
                "asc(weight.position)",
            ],
            distinct: 1,
            highlightPostTag: "</span>",
            highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
            ignorePlurals: true,
            minProximity: 1,
            minWordSizefor1Typo: 3,
            minWordSizefor2Typos: 7,
            ranking: [
                "words",
                "filters",
                "typo",
                "attribute",
                "proximity",
                "exact",
                "custom",
            ],
            removeWordsIfNoResults: "allOptional",
            searchableAttributes: [
                "unordered(hierarchy.lvl0)",
                "unordered(hierarchy.lvl1)",
                "unordered(hierarchy.lvl2)",
                "unordered(hierarchy.lvl3)",
                "unordered(hierarchy.lvl4)",
                "content",
            ],
        },
    },
    ignoreCanonicalTo: false,
    safetyChecks: { beforeIndexPublishing: { maxLostRecordsPercentage: 10 } },
});
```

</div>
</details>