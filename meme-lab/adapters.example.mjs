// Implement these functions using n8n, approved providers, and Cloudflare R2.
// No live credentials or network calls are included in this starter.
export const adapters = {
  async discover({ since, until }) { throw new Error('Configure licensed trend sources'); },
  async generateImage({ prompt }) { throw new Error('Configure image provider'); },
  async generateVideo({ storyboard, seconds = 8 }) { throw new Error('Configure Veo provider'); },
  async generateVoice({ script, voiceId }) { throw new Error('Configure original/licensed TTS voice'); },
  async storeArtifact({ bytes, mimeType, key }) { throw new Error('Configure R2 storage'); },
  async queueForPublishing({ jobId, artifacts }) { throw new Error('Configure approval-gated publishing queue'); }
};
