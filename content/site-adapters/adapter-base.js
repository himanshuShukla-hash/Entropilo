/**
 * Base Site Adapter
 * Provides standard interface for discovering feeds and injecting intervention elements.
 */
class BaseSiteAdapter {
  constructor(name = 'base') {
    this.name = name;
    this.activeCard = null;
    this.observer = null;
  }

  matches(url) {
    return false;
  }

  getFeedContainer() {
    return document.querySelector('main') || document.body;
  }

  getPosts() {
    return Array.from(document.querySelectorAll('article'));
  }

  insertMirrorCard(cardElement) {
    if (this.activeCard && this.activeCard.isConnected) {
      return;
    }
    const container = this.getFeedContainer();
    if (!container) return false;

    const posts = this.getPosts();
    if (posts.length > 2) {
      // Insert after the second or third visible post
      const targetPost = posts[Math.min(2, posts.length - 1)];
      targetPost.insertAdjacentElement('afterend', cardElement);
    } else {
      // Prepend or append to feed container
      container.prepend(cardElement);
    }
    this.activeCard = cardElement;
    return true;
  }

  removeMirrorCard() {
    if (this.activeCard) {
      this.activeCard.remove();
      this.activeCard = null;
    }
    const existing = document.querySelectorAll('.entropilo-mirror-card, #entropilo-mirror-container');
    existing.forEach(el => el.remove());
  }

  observeNewPosts(onNewPosts) {
    const container = this.getFeedContainer();
    if (!container) return;

    this.observer = new MutationObserver((mutations) => {
      let added = false;
      for (const m of mutations) {
        if (m.addedNodes.length > 0) {
          added = true;
          break;
        }
      }
      if (added && typeof onNewPosts === 'function') {
        onNewPosts(this.getPosts().length);
      }
    });

    this.observer.observe(container, { childList: true, subtree: true });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.removeMirrorCard();
  }
}

// Make accessible to other scripts
window.BaseSiteAdapter = BaseSiteAdapter;
