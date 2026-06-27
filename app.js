const state = {
  articles: [],
  currentSlug: ""
};

const els = {
  latestDate: document.querySelector("#latest-date"),
  latestTitle: document.querySelector("#latest-title"),
  latestSummary: document.querySelector("#latest-summary"),
  latestLink: document.querySelector("#latest-link"),
  articleTitle: document.querySelector("#article-title"),
  articleMeta: document.querySelector("#article-meta"),
  articleBody: document.querySelector("#article-body"),
  captionBox: document.querySelector("#caption-box"),
  captionText: document.querySelector("#caption-text"),
  creativeBox: document.querySelector("#creative-box"),
  creativeLink: document.querySelector("#creative-link"),
  sourceList: document.querySelector("#source-list"),
  archiveList: document.querySelector("#archive-list")
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric"
});

init();

async function init() {
  try {
    const response = await fetch("articles/index.json", { cache: "no-store" });
    const articles = response.ok ? await response.json() : [];
    state.articles = [...articles].sort((a, b) => b.date.localeCompare(a.date));
    if (state.articles.length) {
      renderArchive();
    } else {
      renderEmptyArchive();
    }

    const requestedSlug = new URLSearchParams(window.location.search).get("article");
    const firstSlug = requestedSlug || state.articles[0]?.slug;
    if (firstSlug) {
      await loadArticle(firstSlug);
    } else {
      renderEmptyArchive();
    }
  } catch (error) {
    renderEmptyArchive();
  }
}

function renderArchive() {
  els.archiveList.innerHTML = "";

  for (const article of state.articles) {
    const link = document.createElement("a");
    link.className = "archive-card";
    link.href = `?article=${encodeURIComponent(article.slug)}#article`;
    link.dataset.slug = article.slug;
    link.innerHTML = `
      <time datetime="${escapeHtml(article.date)}">${formatDate(article.date)}</time>
      <strong>${escapeHtml(article.title)}</strong>
      <span>${escapeHtml(article.summary || "")}</span>
    `;
    link.addEventListener("click", async (event) => {
      event.preventDefault();
      history.pushState(null, "", link.href);
      await loadArticle(article.slug);
      document.querySelector("#article").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    els.archiveList.append(link);
  }
}

function renderEmptyArchive() {
  if (els.archiveList.children.length) return;

  const empty = document.createElement("div");
  empty.className = "archive-card";
  empty.innerHTML = `
    <time>${formatDate(new Date().toISOString().slice(0, 10))}</time>
    <strong>Ready for the next AI X Post Pack</strong>
    <span>Completed packs will be listed here by date.</span>
  `;
  els.archiveList.append(empty);
}

async function loadArticle(slug) {
  const articleSummary = state.articles.find((article) => article.slug === slug);
  if (!articleSummary) return;

  const response = await fetch(`articles/${encodeURIComponent(slug)}.json`, { cache: "no-store" });
  if (!response.ok) return;

  const article = await response.json();
  state.currentSlug = slug;
  renderArticle({ ...articleSummary, ...article });
}

function renderArticle(article) {
  document.title = `${article.title} | AI Today`;
  els.latestDate.textContent = `Latest update - ${formatDate(article.date)}`;
  els.latestTitle.textContent = article.title;
  els.latestSummary.textContent = article.summary || "";
  els.latestLink.href = `?article=${encodeURIComponent(article.slug)}#article`;

  els.articleTitle.textContent = article.title;
  els.articleMeta.textContent = `${formatDate(article.date)}${article.author ? ` by ${article.author}` : ""}`;
  els.articleBody.innerHTML = markdownToHtml(article.bodyMarkdown || "");

  if (article.caption) {
    els.captionBox.hidden = false;
    els.captionText.textContent = article.caption;
  } else {
    els.captionBox.hidden = true;
    els.captionText.textContent = "";
  }

  if (article.canvaUrl) {
    els.creativeBox.hidden = false;
    els.creativeLink.href = article.canvaUrl;
  } else {
    els.creativeBox.hidden = true;
    els.creativeLink.href = "#";
  }

  els.sourceList.innerHTML = "";
  if (Array.isArray(article.sources) && article.sources.length) {
    for (const source of article.sources) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = source.label || source.url;
      item.append(link);
      els.sourceList.append(item);
    }
  } else {
    const item = document.createElement("li");
    item.textContent = "No source links were attached to this pack.";
    els.sourceList.append(item);
  }

  for (const card of els.archiveList.querySelectorAll(".archive-card")) {
    card.classList.toggle("active", card.dataset.slug === article.slug);
  }
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      html.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return html.join("");
}

function inlineMarkdown(text) {
  return escapeHtml(text).replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function formatDate(value) {
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
