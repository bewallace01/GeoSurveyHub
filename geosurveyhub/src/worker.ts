/**
 * Pass-through to static assets (HTML/CSS/JS). Add API routes here if needed.
 */
interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request, env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
