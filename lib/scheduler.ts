import { getPosts, updatePost } from "./db";

// Check and auto-publish scheduled posts
export async function checkAndPublishScheduledPosts(): Promise<void> {
  try {
    const posts = await getPosts();
    const now = new Date();

    // Find posts that are scheduled but not yet published
    const scheduledPosts = posts.filter(
      (post) => !post.published && new Date(post.publishedDate) <= now
    );

    // Auto-publish each scheduled post
    for (const post of scheduledPosts) {
      try {
        await updatePost(post.id, { published: true });
        console.log(`[Scheduler] Auto-published post: ${post.title} (ID: ${post.id})`);
      } catch (error) {
        console.error(`[Scheduler] Error publishing post ${post.id}:`, error);
      }
    }
  } catch (error) {
    console.error("[Scheduler] Error checking scheduled posts:", error);
  }
}



