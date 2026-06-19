/* ============================================
   时笠的博客 — 文章列表数据 & 渲染逻辑
   ============================================ */

// ---- 动态加载文章列表 ----
let POSTS = [];

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
  return POSTS;
}

// 默认数据（fallback）
function getDefaultPosts() {
  return [
    {
      id:   "hello-world",
      title:"你好，世界",
      date:  "2026-06-19",
      tag:   "life",
      excerpt:"博客开张了。没什么特别的理由，就是想有一个自己的小角落，写点东西，记录点什么。"
    },
    {
      id:   "js-closure",
      title:"我理解的 JavaScript 闭包",
      date:  "2026-06-19",
      tag:   "tech",
      excerpt:"闭包这个词听起来很高大上，但其实概念很简单。这篇文章用最直白的方式讲清楚它到底是什么、为什么有用。"
    }
  ];
}

// ---- 工具：防 XSS ----
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---- 渲染文章列表（通用，接受文章数组） ----
function renderPostList(posts) {
  const container = document.getElementById("postList");
  if (!container) return;

  if (posts.length === 0) {
    container.innerHTML = `<p style="color:var(--text-dim); text-align:center; padding:40px 0;">暂无文章</p>`;
    return;
  }

  container.innerHTML = posts.map(post => `
    <a class="post-card" href="post.html?file=${post.id}">
      <div class="post-card-title">${escapeHtml(post.title)}</div>
      <div class="post-card-meta">
        <span>${escapeHtml(post.date)}</span>
        <span class="tag tag--${post.tag}">${post.tag === "tech" ? "技术" : "生活"}</span>
      </div>
      <div class="post-card-excerpt">${escapeHtml(post.excerpt)}</div>
    </a>
  `).join("");
}

// ---- 首页：筛选逻辑 ----
function initFilter() {
  const filterBar = document.getElementById("filterBar");
  if (!filterBar) return;

  // 初始渲染全部
  renderPostList(POSTS);

  // 筛选按钮点击事件
  filterBar.addEventListener("click", (e) => {
    if (!e.target.classList.contains("filter-btn")) return;

    // 更新 active 状态
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");

    // 筛选
    const tag = e.target.dataset.tag;
    const filtered = tag === "all" ? POSTS : POSTS.filter(p => p.tag === tag);
    renderPostList(filtered);
  });
}

// ---- 分类页：渲染指定标签的文章 ----
function initCategoryPage() {
  const categoryTitle = document.getElementById("categoryTitle");
  if (!categoryTitle) return;

  const params = new URLSearchParams(window.location.search);
  const tag = params.get("tag");

  if (!tag) {
    categoryTitle.textContent = "全部分类";
    document.title = "全部分类 — 时笠的博客";
    renderPostList(POSTS);
    return;
  }

  const tagName = tag === "tech" ? "技术" : "生活";
  categoryTitle.textContent = tagName;
  document.title = `${tagName} — 时笠的博客`;

  const filtered = POSTS.filter(p => p.tag === tag);
  renderPostList(filtered);
}

// ---- 页面加载后初始化 ----
document.addEventListener("DOMContentLoaded", async () => {
  // 先加载文章列表
  await loadPosts();

  // 再初始化页面
  initFilter();      // 首页筛选（仅首页生效）
  initCategoryPage(); // 分类页渲染（仅分类页生效）
});
