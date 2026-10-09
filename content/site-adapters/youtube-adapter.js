/**
 * YouTube Site Adapter
 * Handles video feed discovery, Shorts timeline tracking, and in-feed intervention injection on youtube.com.
 */

class YouTubeSiteAdapter extends BaseSiteAdapter {
  constructor() {
    super('youtube');
  }

  matches(url) {
    return url.includes('youtube.com');
  }

  getFeedContainer() {
    return (
      document.querySelector('ytd-rich-grid-renderer #contents') ||
      document.querySelector('#contents.ytd-rich-grid-renderer') ||
      document.querySelector('ytd-shorts #shorts-container') ||
      document.querySelector('#items.ytd-watch-next-secondary-results-renderer') ||
      document.querySelector('#primary') ||
      document.body
    );
  }

  getPosts() {
    const items = document.querySelectorAll(
      'ytd-rich-item-renderer, ytd-video-renderer, ytd-reel-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer'
    );
    return Array.from(items);
  }

  insertMirrorCard(cardElement) {
    if (this.activeCard && this.activeCard.isConnected) {
      return true;
    }

    const posts = this.getPosts();
    const container = this.getFeedContainer();

    // In YouTube Shorts, position prominently
    if (window.location.pathname.includes('/shorts')) {
      const currentShort = document.querySelector('ytd-reel-video-renderer[is-active]') || posts[0];
      if (currentShort) {
        cardElement.style.maxWidth = '420px';
        cardElement.style.margin = '20px auto';
        currentShort.insertAdjacentElement('afterend', cardElement);
        this.activeCard = cardElement;
        return true;
      }
    }

    // In standard grid / home feed
    let target = null;
    const viewportHeight = window.innerHeight;
    for (const post of posts) {
      const rect = post.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= viewportHeight * 0.75) {
        target = post;
        break;
      }
    }

    if (!target && posts.length > 0) {
      target = posts[Math.min(3, posts.length - 1)];
    }

    if (target && target.parentElement) {
      cardElement.style.maxWidth = '720px';
      cardElement.style.margin = '24px auto';
      cardElement.style.width = '100%';
      target.insertAdjacentElement('afterend', cardElement);
      this.activeCard = cardElement;
      return true;
    } else if (container) {
      container.prepend(cardElement);
      this.activeCard = cardElement;
      return true;
    }

    return false;
  }
}

window.YouTubeSiteAdapter = YouTubeSiteAdapter;
