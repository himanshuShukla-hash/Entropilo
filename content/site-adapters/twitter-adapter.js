/**
 * X / Twitter Site Adapter
 * Specifically handles feed discovery, post counting, and in-timeline card injection on x.com and twitter.com.
 */
class TwitterSiteAdapter extends BaseSiteAdapter {
  constructor() {
    super('twitter');
  }

  matches(url) {
    return url.includes('twitter.com') || url.includes('x.com');
  }

  getFeedContainer() {
    return (
      document.querySelector('[data-testid="primaryColumn"] section[role="region"]') ||
      document.querySelector('[data-testid="primaryColumn"]') ||
      document.querySelector('main[role="main"]') ||
      document.querySelector('section[role="region"]') ||
      document.body
    );
  }

  getPosts() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"], article[role="article"]');
    return Array.from(tweets);
  }

  insertMirrorCard(cardElement) {
    if (this.activeCard && this.activeCard.isConnected) {
      return true;
    }

    const posts = this.getPosts();
    const container = this.getFeedContainer();

    // Find the post currently in the viewport
    let insertionTarget = null;
    const viewportHeight = window.innerHeight;

    for (const post of posts) {
      const rect = post.getBoundingClientRect();
      // Target post near the middle or top of the viewport
      if (rect.top >= 0 && rect.top <= viewportHeight * 0.75) {
        insertionTarget = post;
        break;
      }
    }

    if (!insertionTarget && posts.length > 0) {
      insertionTarget = posts[0];
    }

    if (insertionTarget && insertionTarget.parentElement) {
      // Style card for Twitter feed dimensions
      cardElement.style.maxWidth = '600px';
      cardElement.style.margin = '16px auto';
      cardElement.style.width = '100%';

      insertionTarget.insertAdjacentElement('afterend', cardElement);
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

window.TwitterSiteAdapter = TwitterSiteAdapter;
