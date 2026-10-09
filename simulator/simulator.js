/**
 * EchoNet Feed Generator & Infinite Scroll Engine
 * Simulates a continuous social feed for testing Entropilo's Fugue Engine and Behavioral Mirror.
 */

(function () {
  const streamEl = document.getElementById('posts-stream');
  const sentinelEl = document.getElementById('infinite-scroll-trigger');

  const INITIAL_POSTS = [
    {
      author: 'Hackathon Ops',
      handle: '@hackathon_hq',
      time: '12m',
      avatar: '🏆',
      content: '🚨 OFFICIAL ANNOUNCEMENT: The 2026 AI Innovation Hackathon finalists have been announced! View the winner list and judge scorecards below: <a href="#hackathon-results" class="post-link">hackathon.dev/2026-winners</a>',
      likes: '1.4K',
      retweets: '492'
    },
    {
      author: 'Sarah Chen',
      handle: '@schen_ai',
      time: '24m',
      avatar: '👩‍💻',
      content: 'Just deployed our new multi-agent orchestrator. The hardest part wasn\'t prompt engineering, it was preventing agents from getting trapped in consensus loops. Paper link: <a href="#paper-chen" class="post-link">arxiv.org/abs/2604.1082</a>',
      likes: '852',
      retweets: '143'
    },
    {
      author: 'Tech Insider',
      handle: '@techinsider',
      time: '45m',
      avatar: '📰',
      content: 'Breaking: New study finds the average smartphone user scrolls through 3.2 miles of social media feeds every year. Are digital wellbeing tools doing enough?',
      likes: '3.1K',
      retweets: '918'
    },
    {
      author: 'Alex Rivera',
      handle: '@arivera_dev',
      time: '1h',
      avatar: '👨‍🎨',
      content: 'Hot take: Website blockers don\'t work for deep work because they treat intentional research and mindless dopamine-chasing as the exact same thing. We need goal-aware interventions.',
      likes: '2.4K',
      retweets: '381'
    },
    {
      author: 'Quantum Daily',
      handle: '@quantumdaily',
      time: '2h',
      avatar: '⚛️',
      content: 'Major breakthrough in room-temperature topological quantum computing announced today. Read the full preprint here: <a href="#quantum-news" class="post-link">nature.com/articles/s41586-quantum</a>',
      likes: '912',
      retweets: '205'
    }
  ];

  const PROCEDURAL_AUTHORS = [
    { name: 'DevMemes', handle: '@devmemes', avatar: '😂' },
    { name: 'Code Architecture', handle: '@cleancode', avatar: '📐' },
    { name: 'AI Daily Digest', handle: '@aidigest', avatar: '🤖' },
    { name: 'OpenSource Pulse', handle: '@ospulse', avatar: '🌐' },
    { name: 'Elena Rostova', handle: '@elena_eng', avatar: '👩‍🔬' },
    { name: 'Marcus Brody', handle: '@mbrody', avatar: '🧔' }
  ];

  const PROCEDURAL_TEXTS = [
    'Why spend 5 minutes doing something manually when you can spend 6 hours automating it?',
    'Unpopular opinion: writing clean unit tests is 10x more satisfying than debugging race conditions in production.',
    'Another day, another JavaScript framework. Who wants to bet what next year\'s state management meta will be?',
    'Pro tip: Take a 5-minute break every hour. Your brain is not a server cluster with 99.999% uptime.',
    'Deep learning models are getting faster, but human attention spans are getting shorter. Here is the latest research: <a href="#study" class="post-link">wellbeing.org/attention</a>',
    'Just pushed a commit on Friday at 5:59 PM. Pray for my weekend.',
    'The best debugging tool is still a good night\'s sleep and a fresh cup of coffee.',
    'If you are reading this post on a Friday evening, close your browser and go outside!'
  ];

  let postCounter = 0;

  function createPostElement(data) {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.setAttribute('role', 'article');
    article.setAttribute('data-post-id', String(++postCounter));

    article.innerHTML = `
      <div class="post-avatar">${data.avatar}</div>
      <div class="post-body">
        <div class="post-header">
          <span class="post-author">${data.author}</span>
          <span class="post-handle">${data.handle}</span>
          <span class="post-time">• ${data.time}</span>
        </div>
        <div class="post-content">${data.content}</div>
        <div class="post-footer-actions">
          <span class="post-action">💬 ${Math.floor(Math.random() * 50) + 5}</span>
          <span class="post-action">🔄 ${data.retweets || Math.floor(Math.random() * 100) + 10}</span>
          <span class="post-action">❤️ ${data.likes || Math.floor(Math.random() * 500) + 20}</span>
          <span class="post-action">🔗 Share</span>
        </div>
      </div>
    `;

    return article;
  }

  function appendInitialPosts() {
    for (const post of INITIAL_POSTS) {
      streamEl.appendChild(createPostElement(post));
    }
  }

  function appendMorePosts(count = 6) {
    for (let i = 0; i < count; i++) {
      const author = PROCEDURAL_AUTHORS[Math.floor(Math.random() * PROCEDURAL_AUTHORS.length)];
      const text = PROCEDURAL_TEXTS[Math.floor(Math.random() * PROCEDURAL_TEXTS.length)];
      const post = {
        author: author.name,
        handle: author.handle,
        time: `${Math.floor(Math.random() * 50) + 2}m`,
        avatar: author.avatar,
        content: text,
        likes: `${(Math.random() * 5).toFixed(1)}K`,
        retweets: `${Math.floor(Math.random() * 300) + 20}`
      };
      streamEl.appendChild(createPostElement(post));
    }
  }

  // Setup infinite scroll observer
  function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        appendMorePosts(5);
      }
    }, { rootMargin: '400px' });

    if (sentinelEl) {
      observer.observe(sentinelEl);
    }
  }

  // Initialize
  appendInitialPosts();
  appendMorePosts(4);
  setupInfiniteScroll();
})();
