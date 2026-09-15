const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");

const liquidSource = fs.readFileSync("_includes/collabo.liquid", "utf8");
const referenceAuthorMatch = liquidSource.match(/const COLLABO_RESEARCH_REFERENCE_AUTHOR_ID = '([^']+)'/);
assert.ok(referenceAuthorMatch, "reference author constant not found");
const referenceAuthorId = referenceAuthorMatch[1];
const functionStart = liquidSource.indexOf("function createPcaAuthorColors");
const functionEnd = liquidSource.indexOf("\n  function buildGraph", functionStart);
assert.ok(functionStart >= 0 && functionEnd > functionStart, "vectorizer function not found");

// The extracted function is intentionally pure: the validator exercises the
// exact browser implementation without maintaining a second JS copy.
const instrumentedFunction = liquidSource
  .slice(functionStart, functionEnd)
  .replace(
    /\n    return result;\n  }\s*$/,
    "\n    result.meta.validationVectors = vectors.map(vector => vector.slice());" + "\n    return result;\n  }"
  );
const createPcaAuthorColors = Function(`${instrumentedFunction}\nreturn createPcaAuthorColors;`)();

const srgbToOklab = (rgb) => {
  const linear = rgb.map((channel) => {
    const encoded = channel / 255;
    return encoded <= 0.04045 ? encoded / 12.92 : ((encoded + 0.055) / 1.055) ** 2.4;
  });
  const longL = 0.4122214708 * linear[0] + 0.5363325363 * linear[1] + 0.0514459929 * linear[2];
  const longM = 0.2119034982 * linear[0] + 0.6806995451 * linear[1] + 0.1073969566 * linear[2];
  const longS = 0.0883024619 * linear[0] + 0.2817188376 * linear[1] + 0.6299787005 * linear[2];
  const cubeL = Math.cbrt(longL);
  const cubeM = Math.cbrt(longM);
  const cubeS = Math.cbrt(longS);
  return [
    0.2104542553 * cubeL + 0.793617785 * cubeM - 0.0040720468 * cubeS,
    1.9779984951 * cubeL - 2.428592205 * cubeM + 0.4505937099 * cubeS,
    0.0259040371 * cubeL + 0.7827717662 * cubeM - 0.808675766 * cubeS,
  ];
};

const graphPath = process.argv[2] || "assets/json/collabo_graph.json";
const similarityPath = process.argv[3] || "assets/json/keyword_similarity.json";
const graph = JSON.parse(fs.readFileSync(graphPath, "utf8"));
const similarity = JSON.parse(fs.readFileSync(similarityPath, "utf8"));
assert.equal(graph.meta?.schema_version, 4, "unexpected graph schema");
const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
assert.equal(nodesById.size, graph.nodes.length, "duplicate graph node IDs");
const paperNodes = graph.nodes.filter((node) => node.type === "paper");
assert.ok(paperNodes.length > 0, "individual papers are missing");
const paperEdges = new Set();
graph.links.forEach((link) => {
  assert.ok(nodesById.has(link.source) && nodesById.has(link.target), "dangling graph link");
  if (!link.type.startsWith("paper_")) return;
  assert.equal(nodesById.get(link.source).type, "paper", "paper link has a non-paper source");
  assert.equal(nodesById.get(link.target).type, link.type === "paper_author" ? "author" : "keyword");
  const edge = JSON.stringify([link.source, link.target]);
  assert.ok(!paperEdges.has(edge), "duplicate paper edge");
  paperEdges.add(edge);
});
const paperCountsByAuthor = new Map();
const paperCountsByTopic = new Map();
paperNodes.forEach((paper) => {
  assert.ok(paper.name && paper.bib_key && paper.authors.length, "incomplete paper metadata");
  paper.authors.forEach((author) => {
    assert.ok(paperEdges.has(JSON.stringify([paper.id, author])), "missing paper authorship edge");
    paperCountsByAuthor.set(author, (paperCountsByAuthor.get(author) || 0) + 1);
  });
  paper.keywords.forEach((topic) => {
    const id = `kw:${topic}`;
    if (!nodesById.has(id)) return;
    assert.ok(paperEdges.has(JSON.stringify([paper.id, id])), "missing paper topic edge");
    paperCountsByTopic.set(id, (paperCountsByTopic.get(id) || 0) + 1);
  });
});
graph.nodes.forEach((node) => {
  if (node.type === "author") assert.equal(paperCountsByAuthor.get(node.id), node.paper_count, "author paper count differs from records");
  if (node.type === "keyword") assert.equal(paperCountsByTopic.get(node.id), node.paper_count, "topic paper count differs from records");
});
assert.equal(similarity.version, 4, "unexpected semantic payload schema");
assert.equal(similarity.vectorizer?.scheme, "bm25-multiview-v1", "unexpected vectorizer scheme");
assert.equal(similarity.vectorizer?.lead_alpha, 0.3, "first-author weight drifted");
assert.equal(similarity.vectorizer?.recency_alpha, 0.1, "recency weight drifted");

const vocabulary = new Set();
graph.nodes.forEach((node) => {
  if (node.type === "keyword") vocabulary.add(node.name || node.id.replace(/^kw:/, ""));
  if (node.type === "author") {
    Object.keys(node.topic_profile || {}).forEach((topic) => vocabulary.add(topic));
  }
});
assert.equal(graph.meta?.topic_vocabulary_order, "utf8-bytewise-v1", "unexpected graph vocabulary order");
assert.equal(similarity.vocabulary_order, "utf8-bytewise-v1", "unexpected semantic vocabulary order");
const orderedVocabulary = [...vocabulary].sort((left, right) => Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8")));
const vocabularyHash = crypto.createHash("sha256").update(orderedVocabulary.join("\n")).digest("hex").slice(0, 16);
assert.equal(graph.meta?.topic_vocabulary_size, vocabulary.size, "graph vocabulary size is stale");
assert.equal(graph.meta?.topic_vocabulary_hash, vocabularyHash, "graph vocabulary hash is stale");
assert.equal(similarity.vocabulary_size, vocabulary.size, "semantic vocabulary size is stale");
assert.equal(graph.meta?.topic_vocabulary_hash, similarity.vocabulary_hash, "graph and semantic vocabulary hashes differ");

const expectedTopicIds = new Set(orderedVocabulary.map((topic) => `kw:${topic}`));
assert.deepEqual(new Set(Object.keys(similarity.similarities || {})), expectedTopicIds, "similarity rows are incomplete");
if (similarity.backend === "sentence-transformers") {
  assert.deepEqual(new Set(similarity.topic_vectors?.ids || []), expectedTopicIds, "latent topic IDs are incomplete");
  const latentDimensions = similarity.topic_vectors?.dimensions;
  assert.ok(Number.isInteger(latentDimensions) && latentDimensions > 0, "invalid latent dimensions");
  assert.equal(similarity.topic_vectors.scales?.length, latentDimensions, "invalid latent scales");
  assert.equal(
    Buffer.from(similarity.topic_vectors.data || "", "base64").length,
    vocabulary.size * latentDimensions,
    "invalid latent vector byte length"
  );
} else {
  assert.equal(similarity.backend, "lexical-fallback", "unknown similarity backend");
  assert.equal(similarity.topic_vectors, undefined, "fallback payload should not claim latent vectors");
}

const authors = graph.nodes.filter((node) => node.type === "author");
const keywords = graph.nodes.filter((node) => node.type === "keyword");
assert.ok(
  authors.some((author) => author.id === referenceAuthorId),
  "reference author is missing"
);
const colors = createPcaAuthorColors(authors, keywords, graph.links, similarity, referenceAuthorId);
const reorderedColors = createPcaAuthorColors(
  [...authors].reverse(),
  [...keywords].reverse(),
  [...graph.links].reverse(),
  similarity,
  referenceAuthorId
);
const directOnlyColors = createPcaAuthorColors(authors, keywords, graph.links, null, referenceAuthorId);
const unanchoredColors = createPcaAuthorColors(authors, keywords, graph.links, similarity);
const missingReferenceColors = createPcaAuthorColors(authors, keywords, graph.links, similarity, "validation-missing-reference");
const linkOnlyAuthors = authors.map((author) => ({
  id: author.id,
  type: "author",
  paper_count: author.paper_count,
}));
const duplicateAuthorKeywordLink = graph.links.find((link) => link.type === "author_keyword");
assert.ok(duplicateAuthorKeywordLink, "expected an author-keyword link");
const duplicatedLegacyLinks = [...graph.links, { ...duplicateAuthorKeywordLink }];
const linkOnlyColors = createPcaAuthorColors(linkOnlyAuthors, keywords, duplicatedLegacyLinks, similarity, referenceAuthorId);
const reversedLinkOnlyColors = createPcaAuthorColors(
  [...linkOnlyAuthors].reverse(),
  [...keywords].reverse(),
  [...duplicatedLegacyLinks].reverse(),
  similarity,
  referenceAuthorId
);
const colorsWithUnknownAuthor = createPcaAuthorColors(
  [
    ...authors,
    {
      id: "validation-unknown-author",
      type: "author",
      paper_count: 1,
      topic_profile: {},
      lead_topic_profile: {},
      recent_topic_profile: {},
    },
  ],
  keywords,
  graph.links,
  similarity,
  referenceAuthorId
);
const nonFiniteAuthors = JSON.parse(JSON.stringify(authors));
const nonFiniteAuthor = nonFiniteAuthors.find((author) => Object.keys(author.topic_profile || {}).length);
assert.ok(nonFiniteAuthor, "expected an author with research evidence");
nonFiniteAuthor.topic_profile[Object.keys(nonFiniteAuthor.topic_profile)[0]] = Infinity;
nonFiniteAuthor.paper_count = Infinity;
const nonFiniteColors = createPcaAuthorColors(nonFiniteAuthors, keywords, graph.links, similarity, referenceAuthorId);

assert.equal(colors.size, authors.length, "not every author received a color");
assert.equal(colors.meta.vectorizerScheme, "bm25-multiview-v1");
if (similarity.backend === "sentence-transformers") {
  assert.equal(colors.meta.semanticMode, "latent-topic-pca");
} else {
  assert.ok(["neighbor-diffusion", "direct"].includes(colors.meta.semanticMode));
}
assert.equal(colors.meta.activeComponents, 3, "expected three active color axes");
assert.equal(colors.meta.referenceApplied, true);
assert.equal(colors.meta.referenceAuthorId, referenceAuthorId);
assert.deepEqual(colors.meta.rgbById.get(referenceAuthorId), [255, 255, 255]);
assert.equal(colors.get(referenceAuthorId), "rgb(255, 255, 255)");
assert.deepEqual(colors.meta.scoresById.get(referenceAuthorId), [0, 0, 0]);
assert.equal(colors.meta.referenceSimilarityById.get(referenceAuthorId), 1);
assert.equal(colors.meta.referenceDistanceById.get(referenceAuthorId), 0);
assert.equal(colors.meta.referenceRadialPositionById.get(referenceAuthorId), 0);
assert.equal(colors.meta.colorMapping, "reference-polar-oklab-v1");
assert.equal(colors.meta.referenceElevationChroma, 0.16);
assert.ok(Math.abs(colors.meta.referenceHueRotation - (11 * Math.PI) / 12) <= 1e-12);
assert.ok(colors.meta.leadAlpha > colors.meta.recencyAlpha, "first-author topics are not weighted above recent topics");
assert.ok(Math.abs(colors.meta.coreTopicAlpha + colors.meta.leadAlpha + colors.meta.recencyAlpha - 1) <= 1e-12);
assert.ok(Math.abs(colors.meta.coreTopicAlpha - 0.6) <= 1e-12);
assert.ok(Math.abs(colors.meta.leadAlpha - 0.3) <= 1e-12);
assert.equal(directOnlyColors.size, authors.length, "direct fallback lost authors");
assert.equal(directOnlyColors.meta.semanticApplied, false);
assert.deepEqual(directOnlyColors.meta.rgbById.get(referenceAuthorId), [255, 255, 255]);
assert.equal(missingReferenceColors.meta.referenceApplied, false);
assert.deepEqual(colors.meta.rawScores, unanchoredColors.meta.rawScores, "reference changed the global PCA projection");
for (const author of authors) {
  assert.equal(missingReferenceColors.get(author.id), unanchoredColors.get(author.id), `missing-reference fallback changed color: ${author.id}`);
  assert.deepEqual(
    colors.meta.baseRgbById.get(author.id),
    unanchoredColors.meta.rgbById.get(author.id),
    `reference changed the shared base color: ${author.id}`
  );
}
if (similarity.backend === "sentence-transformers") {
  const semanticDisabledPayload = JSON.parse(JSON.stringify(similarity));
  semanticDisabledPayload.alpha = 0;
  const semanticDisabledColors = createPcaAuthorColors(authors, keywords, graph.links, semanticDisabledPayload, referenceAuthorId);
  assert.equal(semanticDisabledColors.meta.semanticApplied, false);
  assert.equal(semanticDisabledColors.meta.semanticMode, "direct");
  assert.deepEqual(semanticDisabledColors.meta.rgbById.get(referenceAuthorId), [255, 255, 255]);
}

const referenceAuthorIndex = colors.meta.authorIds.indexOf(referenceAuthorId);
const referenceVector = colors.meta.validationVectors[referenceAuthorIndex];
const unknownResearchIdSet = new Set(colors.meta.unknownResearchIds);
const multiviewAuthor = authors.find(
  (author) => Object.keys(author.lead_topic_profile || {}).length > 0 && Object.keys(author.recent_topic_profile || {}).length > 0
);
assert.ok(multiviewAuthor, "expected an author with lead and recent topic evidence");
const multiviewVector = colors.meta.validationVectors[colors.meta.authorIds.indexOf(multiviewAuthor.id)];
const recentChannelStart = multiviewVector.length - colors.meta.topicCount;
const leadChannelStart = recentChannelStart - colors.meta.topicCount;
const channelEnergy = (start, end) => multiviewVector.slice(start, end).reduce((sum, value) => sum + value * value, 0);
const leadChannelEnergy = channelEnergy(leadChannelStart, recentChannelStart);
const recentChannelEnergy = channelEnergy(recentChannelStart, multiviewVector.length);
assert.ok(Math.abs(leadChannelEnergy - colors.meta.leadAlpha) <= 1e-10);
assert.ok(Math.abs(recentChannelEnergy - colors.meta.recencyAlpha) <= 1e-10);
assert.ok(leadChannelEnergy > recentChannelEnergy, "first-author channel did not receive the larger vector weight");
for (const [authorId, color] of colors) {
  assert.equal(color, reorderedColors.get(authorId), `order-dependent color: ${authorId}`);
  assert.equal(color, colorsWithUnknownAuthor.get(authorId), `empty profile changed an existing color: ${authorId}`);
  const rgb = colors.meta.rgbById.get(authorId);
  assert.equal(rgb?.length, 3, `missing RGB triplet: ${authorId}`);
  rgb.forEach((channel) => {
    assert.ok(Number.isInteger(channel) && channel >= 0 && channel <= 255);
  });
  if (unknownResearchIdSet.has(authorId)) continue;

  const authorIndex = colors.meta.authorIds.indexOf(authorId);
  const vector = colors.meta.validationVectors[authorIndex];
  const rawScores = colors.meta.rawScores[authorIndex];
  const relativeScores = colors.meta.scoresById.get(authorId);
  relativeScores.forEach((score, axis) => {
    const expectedScore = rawScores[axis] - colors.meta.referencePcaScores[axis];
    assert.ok(Math.abs(score - expectedScore) <= 1e-12);
  });

  const dotProduct = vector.reduce((sum, value, index) => sum + value * referenceVector[index], 0);
  const expectedSimilarity = authorId === referenceAuthorId ? 1 : Math.max(-1, Math.min(1, dotProduct));
  const actualSimilarity = colors.meta.referenceSimilarityById.get(authorId);
  assert.ok(Math.abs(actualSimilarity - expectedSimilarity) <= 1e-12);
  const expectedDistance = Math.sqrt(Math.max(0, (1 - expectedSimilarity) / 2));
  const actualDistance = colors.meta.referenceDistanceById.get(authorId);
  assert.ok(Math.abs(actualDistance - expectedDistance) <= 1e-12);

  const radialPosition = colors.meta.referenceRadialPositionById.get(authorId);
  assert.ok(Number.isFinite(radialPosition) && radialPosition >= 0 && radialPosition <= 1);
  const expectedLightness = 1 - colors.meta.referenceLightnessDrop * radialPosition;
  const actualLightness = srgbToOklab(rgb)[0];
  assert.ok(Math.abs(actualLightness - expectedLightness) <= 0.004, `reference lightness drift: ${authorId}`);
}
const distanceOrderedAuthors = colors.meta.authorIds
  .filter((authorId) => !unknownResearchIdSet.has(authorId))
  .map((authorId) => ({
    distance: colors.meta.referenceDistanceById.get(authorId),
    radialPosition: colors.meta.referenceRadialPositionById.get(authorId),
  }))
  .sort((left, right) => left.distance - right.distance);
for (let index = 1; index < distanceOrderedAuthors.length; index++) {
  assert.ok(
    distanceOrderedAuthors[index].radialPosition >= distanceOrderedAuthors[index - 1].radialPosition - 1e-12,
    "reference distance mapping is not monotonic"
  );
}
for (const author of authors) {
  assert.equal(linkOnlyColors.get(author.id), reversedLinkOnlyColors.get(author.id), `legacy link order changed color: ${author.id}`);
}
assert.deepEqual(linkOnlyColors.meta.rgbById.get(referenceAuthorId), [255, 255, 255]);
for (const rgb of nonFiniteColors.meta.rgbById.values()) {
  rgb.forEach((channel) => {
    assert.ok(Number.isInteger(channel) && channel >= 0 && channel <= 255);
  });
}

const evidenceGroups = new Map();
authors.forEach((author) => {
  const orderedProfile = (profile) => Object.entries(profile || {}).sort(([left], [right]) => left.localeCompare(right));
  const signature = JSON.stringify([
    orderedProfile(author.topic_profile),
    orderedProfile(author.lead_topic_profile),
    orderedProfile(author.recent_topic_profile),
  ]);
  if (!evidenceGroups.has(signature)) evidenceGroups.set(signature, []);
  evidenceGroups.get(signature).push(author.id);
});
for (const authorIds of evidenceGroups.values()) {
  assert.equal(new Set(authorIds.map((authorId) => colors.get(authorId))).size, 1, `identical evidence diverged: ${authorIds.join(", ")}`);
}

const vectorGroups = new Map();
colors.meta.validationVectors.forEach((vector, authorIndex) => {
  const signature = JSON.stringify(vector);
  if (!vectorGroups.has(signature)) vectorGroups.set(signature, []);
  vectorGroups.get(signature).push(colors.meta.authorIds[authorIndex]);
});
for (const authorIds of vectorGroups.values()) {
  assert.equal(new Set(authorIds.map((authorId) => colors.get(authorId))).size, 1, `identical vectors diverged: ${authorIds.join(", ")}`);
}
const distinctVectorColors = new Set([...vectorGroups.values()].map((authorIds) => colors.get(authorIds[0])));
assert.ok(distinctVectorColors.size / vectorGroups.size >= 0.98, "too many distinct research vectors collapsed to the same RGB color");
const referenceVectorSignature = JSON.stringify(colors.meta.validationVectors[colors.meta.authorIds.indexOf(referenceAuthorId)]);
for (const [signature, authorIds] of vectorGroups) {
  if (signature !== referenceVectorSignature) {
    assert.notEqual(colors.get(authorIds[0]), "rgb(255, 255, 255)");
  }
}
colors.meta.unknownResearchIds.forEach((authorId) => {
  assert.deepEqual(colors.meta.rgbById.get(authorId), [128, 128, 128]);
});

const referenceAuthor = authors.find((author) => author.id === referenceAuthorId);
const referenceTwinId = "validation-reference-twin";
const colorsWithReferenceTwin = createPcaAuthorColors(
  [
    ...authors,
    {
      ...JSON.parse(JSON.stringify(referenceAuthor)),
      id: referenceTwinId,
      name: referenceTwinId,
    },
  ],
  keywords,
  graph.links,
  similarity,
  referenceAuthorId
);
assert.deepEqual(colorsWithReferenceTwin.meta.rgbById.get(referenceAuthorId), [255, 255, 255]);
assert.deepEqual(colorsWithReferenceTwin.meta.rgbById.get(referenceTwinId), [255, 255, 255]);

const noEvidenceColors = createPcaAuthorColors(
  [
    {
      id: "no-evidence",
      type: "author",
      paper_count: 1,
      topic_profile: {},
      lead_topic_profile: {},
      recent_topic_profile: {},
    },
  ],
  [],
  [],
  null,
  "no-evidence"
);
assert.equal(noEvidenceColors.meta.activeComponents, 0);
assert.equal(noEvidenceColors.meta.referenceApplied, false);
assert.deepEqual(noEvidenceColors.meta.rgbById.get("no-evidence"), [128, 128, 128]);

console.log(
  `research vectors valid: ${authors.length} authors, ` +
    `${vectorGroups.size} distinct vectors, ` +
    `${distinctVectorColors.size} distinct colors, ` +
    `${colors.meta.pcaFitProfileCount} PCA fit profiles`
);
