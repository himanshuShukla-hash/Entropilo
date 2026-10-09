/**
 * Generic Site Adapter
 * Works on any standard social/feed layout including the local demo Simulator.
 */
class GenericSiteAdapter extends BaseSiteAdapter {
  constructor() {
    super('generic');
  }

  matches(url) {
    return true; // Fallback for any page
  }

  getFeedContainer() {
    return (
      document.querySelector('#feed-container') ||
      document.querySelector('[role="feed"]') ||
      document.querySelector('.feed') ||
      document.querySelector('main') ||
      document.body
    );
  }

  getPosts() {
    const selectors = [
      '.post-card',
      'article',
      '[role="article"]',
      '.feed-item',
      '.timeline-item'
    ];
    for (const sel of selectors) {
      const items = document.querySelectorAll(sel);
      if (items.length > 0) return Array.from(items);
    }
    return Array.from(document.querySelectorAll('article'));
  }

  insertMirrorCard(cardElement) {
    if (this.activeCard && this.activeCard.isConnected) {
      return true;
    }

    const posts = this.getPosts();
    const container = this.getFeedContainer();

    if (posts.length > 0) {
      // Find the post currently visible or closest to scroll position
      let target = posts[0];
      const viewportHeight = window.innerHeight;
      for (const p of posts) {
        const rect = p.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= viewportHeight * 0.6) {
          target = p;
          break;
        }
      }
      target.insertAdjacentElement('afterend', cardElement);
      this.activeCard = cardElement;
      return true;
    } else if (container) {
      container.prepend(cardElement);
      this.activeCard = cardElement;
      return true;
    }

    document.body.prepend(cardElement);
    this.activeCard = cardElement;
    return true;
  }
}

window.GenericSiteAdapter = GenericSiteAdapter;
