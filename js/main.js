/**
 * 静思录 — Blog JavaScript
 * Features: dark mode, category filter, search, likes, shares,
 *           comment validation, article detail view
 */
(function () {
  'use strict';

  // ============================================================
  // 1. DARK MODE TOGGLE
  // ============================================================
  var html = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');

  var savedTheme = localStorage.getItem('blog-theme');
  if (savedTheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', function () {
    var current = html.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('blog-theme', next);
  });

  // ============================================================
  // 2. CATEGORY FILTERING
  // ============================================================
  var filterButtons = document.querySelectorAll('.filter-btn');
  var articles = document.querySelectorAll('.entry');
  var totalCountEl = document.getElementById('total-count');
  var archiveLink = document.getElementById('archive-link');
  var detailView = document.getElementById('detail-view');
  var articlesContainer = document.getElementById('articles-container');
  var detailBack = document.getElementById('detail-back');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Ensure list view is shown
      showListView();

      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      filterButtons.forEach(function (b) {
        var marker = b.querySelector('.geo-marker');
        if (marker) {
          if (b.classList.contains('active')) {
            marker.classList.remove('hollow');
            marker.classList.add('filled');
          } else {
            marker.classList.remove('filled');
            marker.classList.add('hollow');
          }
        }
      });

      var category = btn.getAttribute('data-category');
      var visibleCount = 0;

      articles.forEach(function (article) {
        if (category === 'all' || article.getAttribute('data-category') === category) {
          article.classList.remove('hidden');
          visibleCount++;
        } else {
          article.classList.add('hidden');
        }
      });

      if (totalCountEl) {
        totalCountEl.textContent = visibleCount;
      }

      updateIssueVisibility();
    });
  });

  function updateIssueVisibility() {
    var issues = document.querySelectorAll('.issue');
    issues.forEach(function (issue) {
      var visibleEntries = issue.querySelectorAll('.entry:not(.hidden)');
      issue.style.display = visibleEntries.length === 0 ? 'none' : '';
    });
  }

  // ============================================================
  // 3. SEARCH
  // ============================================================
  var searchInput = document.getElementById('search-input');
  var searchTimeout;

  searchInput.addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      performSearch(searchInput.value.trim().toLowerCase());
    }, 200);
  });

  function performSearch(query) {
    // Ensure list view
    showListView();

    var visibleCount = 0;

    articles.forEach(function (article) {
      article.classList.remove('search-match');

      if (query === '') {
        article.classList.remove('hidden');
        var activeFilter = document.querySelector('.filter-btn.active');
        if (activeFilter && activeFilter.getAttribute('data-category') !== 'all') {
          var cat = activeFilter.getAttribute('data-category');
          if (article.getAttribute('data-category') !== cat) {
            article.classList.add('hidden');
          }
        }
      } else {
        var title = (article.querySelector('.entry-title') || article.querySelector('.entry-title-sm') || {}).textContent || '';
        var excerpt = (article.querySelector('.entry-excerpt') || article.querySelector('.entry-excerpt-sm') || {}).textContent || '';
        var full = (article.querySelector('.entry-content') || {}).textContent || '';
        var text = (title + ' ' + excerpt + ' ' + full).toLowerCase();

        if (text.includes(query)) {
          article.classList.remove('hidden');
          article.classList.add('search-match');
          visibleCount++;
        } else {
          article.classList.add('hidden');
        }
      }
    });

    if (totalCountEl && query === '') {
      totalCountEl.textContent = document.querySelectorAll('.entry:not(.hidden)').length;
    } else if (totalCountEl && query !== '') {
      totalCountEl.textContent = visibleCount;
    }

    updateIssueVisibility();
    showNoResults(query, visibleCount);
  }

  function showNoResults(query, count) {
    var existing = document.querySelector('.no-results');
    if (existing) existing.remove();

    if (query !== '' && count === 0) {
      var msg = document.createElement('div');
      msg.className = 'no-results';
      msg.textContent = '未找到匹配的文章';
      articlesContainer.appendChild(msg);
    }
  }

  // ============================================================
  // 4. SIDEBAR COMMENT FORM
  // ============================================================
  var commentForm = document.getElementById('comment-form');
  var commentTextarea = document.getElementById('comment-textarea');
  var commentError = document.getElementById('comment-error');
  var commentsList = document.getElementById('comments-list');

  commentForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var content = commentTextarea.value.trim();

    if (content === '') {
      commentError.classList.add('visible');
      commentTextarea.classList.add('error');
      return;
    }

    commentError.classList.remove('visible');
    commentTextarea.classList.remove('error');

    addSidebarComment(content);
    commentTextarea.value = '';
  });

  commentTextarea.addEventListener('input', function () {
    if (commentTextarea.value.trim() !== '') {
      commentError.classList.remove('visible');
      commentTextarea.classList.remove('error');
    }
  });

  function addSidebarComment(content) {
    var now = new Date();
    var timeStr = formatTime(now);

    var item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML =
      '<p>' + escapeHTML(content) + '</p>' +
      '<div class="comment-time">匿名读者 · ' + timeStr + '</div>';

    if (commentsList.firstChild) {
      commentsList.insertBefore(item, commentsList.firstChild);
    } else {
      commentsList.appendChild(item);
    }

    saveSidebarComment(content, timeStr);
  }

  function loadSidebarComments() {
    try {
      var saved = JSON.parse(localStorage.getItem('blog-sidebar-comments') || '[]');
      saved.forEach(function (c) {
        var item = document.createElement('div');
        item.className = 'comment-item';
        item.innerHTML =
          '<p>' + escapeHTML(c.content) + '</p>' +
          '<div class="comment-time">匿名读者 · ' + c.time + '</div>';
        commentsList.appendChild(item);
      });
    } catch (e) { /* ignore */ }
  }

  function saveSidebarComment(content, timeStr) {
    try {
      var saved = JSON.parse(localStorage.getItem('blog-sidebar-comments') || '[]');
      saved.unshift({ content: content, time: timeStr });
      if (saved.length > 20) saved.pop();
      localStorage.setItem('blog-sidebar-comments', JSON.stringify(saved));
    } catch (e) { /* ignore */ }
  }

  // ============================================================
  // 5. DETAIL VIEW — Article + Per-post Comments (Weibo-style)
  // ============================================================
  var currentPostId = null;

  // "阅读" link on each article
  var readLinks = document.querySelectorAll('.read-link');
  readLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var article = link.closest('.entry');
      if (!article) return;
      var postId = article.getAttribute('id');
      openDetailView(postId, article);
    });
  });

  // Also allow clicking article titles to open detail
  articles.forEach(function (article) {
    article.addEventListener('click', function (e) {
      // Don't trigger if clicking like/share buttons
      if (e.target.closest('.meta-btn') || e.target.closest('.read-link')) return;
      var postId = article.getAttribute('id');
      openDetailView(postId, article);
    });
    article.style.cursor = 'pointer';
  });

  // Back button
  detailBack.addEventListener('click', function () {
    showListView();
  });

  function openDetailView(postId, article) {
    currentPostId = postId;

    // Collect article data
    var numberEl = article.querySelector('.entry-number');
    var categoryEl = article.querySelector('.entry-category');
    var badgeEl = article.querySelector('.entry-badge');
    var titleEl = article.querySelector('.entry-title') || article.querySelector('.entry-title-sm');
    var contentEl = article.querySelector('.entry-content');
    var diamondEl = article.querySelector('.geo-diamond-rotated');
    var metaEl = article.querySelector('.entry-meta') || article.querySelector('.entry-meta-sm');

    var numberHTML = numberEl ? numberEl.outerHTML : '';
    var diamondHTML = diamondEl ? diamondEl.outerHTML : '';
    var badgeHTML = badgeEl ? badgeEl.outerHTML : '';
    var categoryHTML = categoryEl ? categoryEl.outerHTML : '';
    var titleHTML = titleEl ? titleEl.outerHTML : '';
    var contentHTML = contentEl ? contentEl.innerHTML : '';
    var metaClone = metaEl ? metaEl.cloneNode(true) : null;

    // Remove read-link from meta clone
    if (metaClone) {
      var readLinkClone = metaClone.querySelector('.read-link');
      if (readLinkClone) readLinkClone.remove();
    }

    // Build detail article HTML
    var detailArticle = document.getElementById('detail-article');
    var headHTML = '';
    if (numberEl) {
      headHTML += '<div class="entry-head">' + numberHTML + diamondHTML;
      if (badgeEl) headHTML += badgeHTML;
      headHTML += '<span class="vr"></span>' + categoryHTML + '</div>';
    }

    detailArticle.innerHTML =
      headHTML +
      '<h2 class="entry-title">' + (titleEl ? titleEl.textContent : '') + '</h2>' +
      '<div class="entry-content">' + contentHTML + '</div>' +
      (metaClone ? '<div class="entry-meta-row">' + metaClone.innerHTML + '</div>' : '');

    // Show detail view, hide list
    var issues = document.querySelectorAll('.issue');
    issues.forEach(function (i) { i.style.display = 'none'; });
    if (archiveLink) archiveLink.style.display = 'none';
    var noResults = document.querySelector('.no-results');
    if (noResults) noResults.style.display = 'none';
    detailView.style.display = '';

    // Load per-post comments
    renderDetailComments(postId);

    // Scroll to top of detail
    detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showListView() {
    detailView.style.display = 'none';
    currentPostId = null;
    updateIssueVisibility();
    if (archiveLink) archiveLink.style.display = '';
    var noResults = document.querySelector('.no-results');
    if (noResults) noResults.style.display = '';
  }

  // ============================================================
  // 6. PER-POST COMMENTS (Weibo-style detail page)
  // ============================================================
  function renderDetailComments(postId) {
    var container = document.getElementById('detail-comments');
    var comments = getPostComments(postId);

    var html = '<div class="detail-comments-header">评论 ' + (comments.length > 0 ? '(' + comments.length + ')' : '') + '</div>';

    if (comments.length === 0) {
      html += '<div class="no-comments">还没有评论，来说点什么吧</div>';
    } else {
      html += '<div class="detail-comments-list">';
      comments.forEach(function (c) {
        html +=
          '<div class="comment-bubble">' +
          '<div class="comment-author">' + escapeHTML(c.name || '匿名读者') + '</div>' +
          '<div class="comment-text">' + escapeHTML(c.content) + '</div>' +
          '<div class="comment-time">' + escapeHTML(c.time) + '</div>' +
          '</div>';
      });
      html += '</div>';
    }

    // Comment form
    html +=
      '<div class="detail-comment-form">' +
      '<div class="form-row">' +
      '<input type="text" id="detail-comment-input" placeholder="写下你的评论..." maxlength="500">' +
      '<button class="form-submit" id="detail-comment-submit">发布</button>' +
      '</div>' +
      '<div class="form-error" id="detail-comment-error">评论不能为空</div>' +
      '</div>';

    container.innerHTML = html;

    // Bind form events
    var input = document.getElementById('detail-comment-input');
    var submitBtn = document.getElementById('detail-comment-submit');
    var errorEl = document.getElementById('detail-comment-error');

    submitBtn.addEventListener('click', function () {
      submitDetailComment(postId, input, errorEl);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitDetailComment(postId, input, errorEl);
      }
    });

    input.addEventListener('input', function () {
      if (input.value.trim() !== '') {
        errorEl.classList.remove('visible');
        input.classList.remove('error');
      }
    });
  }

  function submitDetailComment(postId, input, errorEl) {
    var content = input.value.trim();
    if (content === '') {
      errorEl.classList.add('visible');
      input.classList.add('error');
      return;
    }

    errorEl.classList.remove('visible');
    input.classList.remove('error');

    var now = new Date();
    var timeStr = formatTime(now);

    // Save
    var comments = getPostComments(postId);
    comments.unshift({ name: '匿名读者', content: content, time: timeStr });
    if (comments.length > 50) comments.pop();
    savePostComments(postId, comments);

    // Re-render
    renderDetailComments(postId);
  }

  function getPostComments(postId) {
    try {
      var all = JSON.parse(localStorage.getItem('blog-post-comments') || '{}');
      return all[postId] || [];
    } catch (e) {
      return [];
    }
  }

  function savePostComments(postId, comments) {
    try {
      var all = JSON.parse(localStorage.getItem('blog-post-comments') || '{}');
      all[postId] = comments;
      localStorage.setItem('blog-post-comments', JSON.stringify(all));
    } catch (e) { /* ignore */ }
  }

  // ============================================================
  // 7. LIKE BUTTONS
  // ============================================================
  var likeButtons = document.querySelectorAll('.like-btn');
  var likeCounts = {};
  try { likeCounts = JSON.parse(localStorage.getItem('blog-likes') || '{}'); } catch (e) {}

  likeButtons.forEach(function (btn) {
    var postId = btn.getAttribute('data-post');
    var countEl = btn.querySelector('.like-count');
    if (likeCounts[postId] !== undefined && countEl) {
      countEl.textContent = likeCounts[postId];
    }
  });

  likeButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var postId = btn.getAttribute('data-post');
      var countEl = btn.querySelector('.like-count');
      var currentCount = parseInt(countEl.textContent, 10) || 0;

      if (btn.classList.contains('liked')) {
        btn.classList.remove('liked');
        currentCount = Math.max(0, currentCount - 1);
      } else {
        btn.classList.add('liked');
        currentCount++;
        btn.classList.remove('liked');
        void btn.offsetWidth;
        btn.classList.add('liked');
      }

      countEl.textContent = currentCount;
      likeCounts[postId] = currentCount;
      localStorage.setItem('blog-likes', JSON.stringify(likeCounts));
    });
  });

  // ============================================================
  // 8. SHARE BUTTONS
  // ============================================================
  var shareButtons = document.querySelectorAll('.share-btn');
  var shareCounts = {};
  try { shareCounts = JSON.parse(localStorage.getItem('blog-shares') || '{}'); } catch (e) {}

  shareButtons.forEach(function (btn) {
    var postId = btn.getAttribute('data-post');
    var countEl = btn.querySelector('.share-count');
    if (shareCounts[postId] !== undefined && countEl) {
      countEl.textContent = shareCounts[postId];
    }
  });

  shareButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var postId = btn.getAttribute('data-post');
      var countEl = btn.querySelector('.share-count');
      var currentCount = parseInt(countEl.textContent, 10) || 0;
      currentCount++;
      countEl.textContent = currentCount;
      shareCounts[postId] = currentCount;
      localStorage.setItem('blog-shares', JSON.stringify(shareCounts));
      showShareFeedback();
    });
  });

  function showShareFeedback() {
    var existing = document.querySelector('.shared-feedback');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'shared-feedback';
    toast.textContent = '已复制分享链接';
    document.body.appendChild(toast);

    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 1500);
  }

  // ============================================================
  // UTILS
  // ============================================================
  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function formatTime(date) {
    return date.getFullYear() + '.' +
      String(date.getMonth() + 1).padStart(2, '0') + '.' +
      String(date.getDate()).padStart(2, '0') + ' ' +
      String(date.getHours()).padStart(2, '0') + ':' +
      String(date.getMinutes()).padStart(2, '0');
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    loadSidebarComments();
  }

  init();

})();
