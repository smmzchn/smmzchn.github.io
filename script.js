// ============================================
// 时笠的博客 — 文章列表渲染 + 搜索 + 筛选 + 分页
// ============================================

// ---- 全局变量 ----
let POSTS = [];
let filteredPosts = [];
let currentPage = 1;
const POSTS_PER_PAGE = 5;

// ---- 加载文章列表 ----
async function loadPosts() {
  try {
    const resp = await fetch("posts.json?t=" + Date.now());
    if (resp.ok) {
      POSTS = await resp.json();
    } else {
      console.warn("无法加载 posts.json，使用默认数据");
      POSTS = getDefaultPosts();
    }
  } catch (e) {
    console.warn("加载文章列表失败，使用默认数据", e);
    POSTS = getDefaultPosts();
  }
}

function getDefaultPosts() {
  return [
    {
      id: "hello-world",
      title: "你好，世界",
      date: "2026-06-19",
      tag: "life",
      excerpt: "博客开张了。没什么特别的理由，就是想有一个自己的小角落，写点东西，记录点什么。"
    },
    {
      id: "js-closure",
      title: "我理解的 JavaScript 闭包",
      date: "2026-06-19",
      tag: "tech",
      excerpt: "闭包这个词听起来很高大上，但其实概念很简单。这篇文章用最直白的方式讲清楚它到底是什么、为什么有用。"
    }
  ];
}

// ---- 工具 ----
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) return parts[0] + " · " + parts[1] + " · " + parts[2];
  return dateStr;
}

function tagName(tag) {
  const map = { tech: "技术", life: "生活", read: "读书" };
  return map[tag] || tag;
}

function gradientClass(tag) {
  const map = { tech: "grad-tech", life: "grad-life", read: "grad-read" };
  return map[tag] || "grad-tech";
}

// ---- 渲染文章列表 ----
function renderPostList(posts) {
  const container = document.getElementById("postList");
  if (!container) return;

  if (posts.length === 0) {
    container.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:40px 0;font-family:var(--font-body);font-size:14px;">暂无文章</p>';
    return;
  }

  container.innerHTML = posts.map(p => {
    const tag = p.tag || "life";
    return `
    <a class="post-card" href="post.html?file=${p.id}">
      <div class="post-card-body">
        <div class="post-card-tags">
          <span class="tag tag--primary">${tagName(tag)}</span>
          ${tag === "tech" ? '<span class="tag tag--secondary">前端</span>' : ""}
        </div>
        <div class="post-card-title">${escapeHtml(p.title)}</div>
        <div class="post-card-excerpt">${escapeHtml(p.excerpt || "")}</div>
        <div class="post-card-date">${formatDate(p.date)}</div>
      </div>
      <div class="post-card-image">
        <div class="post-card-image-inner ${gradientClass(tag)}"></div>
      </div>
    </a>`;
  }).join("");
}

// ---- 渲染精选卡片 ----
function renderFeatured() {
  const card = document.getElementById("featuredCard");
  const titleEl = document.getElementById("featuredTitle");
  const dateEl = document.getElementById("featuredDate");
  const linkEl = document.getElementById("featuredLink");
  if (!card || POSTS.length === 0) return;

  // 取最新一篇文章作为精选
  const sorted = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
  const featured = sorted[0];
  if (!featured) return;

  card.style.display = "flex";
  titleEl.textContent = featured.title;
  dateEl.textContent = formatDate(featured.date);
  linkEl.href = "post.html?file=" + featured.id;
}

// ---- 渲染分页 ----
function renderPagination(totalPosts) {
  const el = document.getElementById("pagination");
  if (!el) return;

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  if (totalPages <= 1) { el.innerHTML = ""; return; }

  let html = "";

  html += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" data-page="prev" ${currentPage === 1 ? 'disabled' : ''}>←</button>`;

  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  if (start > 1) {
    html += `<button class="page-btn" data-page="1">1</button>`;
    if (start > 2) html += '<span class="page-ellipsis">…</span>';
  }
  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  if (end < totalPages) {
    if (end < totalPages - 1) html += '<span class="page-ellipsis">…</span>';
    html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
  }

  html += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" data-page="next" ${currentPage === totalPages ? 'disabled' : ''}>→</button>`;

  el.innerHTML = html;

  el.querySelectorAll(".page-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      const page = btn.dataset.page;
      if (page === "prev") currentPage--;
      else if (page === "next") currentPage++;
      else currentPage = parseInt(page);
      updateDisplay();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// ---- 更新显示 ----
function updateDisplay() {
  const source = filteredPosts.length > 0 ? filteredPosts : POSTS;
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const pagePosts = source.slice(start, start + POSTS_PER_PAGE);
  renderPostList(pagePosts);
  renderPagination(source.length);
}

// ---- 标签筛选 ----
function initFilter() {
  const bar = document.getElementById("filterBar");
  if (!bar) return;
  bar.addEventListener("click", (e) => {
    if (!e.target.classList.contains("filter-btn")) return;
    bar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    e.target.classList.add("active");
    const tag = e.target.dataset.tag;
    applyCombinedFilter(tag);
  });
}

function applyCombinedFilter(tag) {
  const searchQuery = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
  if (tag === "all" && !searchQuery) {
    filteredPosts = [];
  } else if (tag === "all") {
    filteredPosts = POSTS.filter(p => matchSearch(p, searchQuery));
  } else if (!searchQuery) {
    filteredPosts = POSTS.filter(p => p.tag === tag);
  } else {
    filteredPosts = POSTS.filter(p => p.tag === tag && matchSearch(p, searchQuery));
  }
  currentPage = 1;
  updateDisplay();
}

function matchSearch(p, query) {
  return p.title.toLowerCase().includes(query) || (p.excerpt || "").toLowerCase().includes(query);
}

// ---- 搜索 ----
function initSearch() {
  const input = document.getElementById("searchInput");
  const clear = document.getElementById("searchClear");
  if (!input) return;

  let timeout;
  input.addEventListener("input", () => {
    const q = input.value.trim();
    clear.classList.toggle("visible", q.length > 0);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const activeTag = document.querySelector(".filter-btn.active")?.dataset.tag || "all";
      applyCombinedFilter(activeTag);
    }, 300);
  });
  clear.addEventListener("click", () => {
    input.value = "";
    clear.classList.remove("visible");
    const activeTag = document.querySelector(".filter-btn.active")?.dataset.tag || "all";
    applyCombinedFilter(activeTag);
  });
}

// ---- 分类页 ----
function initCategoryPage() {
  const titleEl = document.getElementById("categoryTitle");
  if (!titleEl) return;
  const params = new URLSearchParams(window.location.search);
  const tag = params.get("tag");
  const name = tag === "tech" ? "技术" : tag === "life" ? "生活" : "全部分类";
  titleEl.textContent = name;
  document.title = name + " — 时笠的博客";
  const filtered = tag ? POSTS.filter(p => p.tag === tag) : POSTS;
  renderPostList(filtered);
}

// ---- 初始化 ----
document.addEventListener("DOMContentLoaded", async () => {
  await loadPosts();
  renderFeatured();
  initFilter();
  initSearch();
  initCategoryPage();
  updateDisplay();
});
