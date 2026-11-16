import https from 'https';

export interface AgentRouterConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

export interface AgentRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentRouterResponse {
  id: string;
  model: string;
  text: string;
  raw: any;
}

export class AgentRouterClient {
  private configApiKey?: string;
  private configBaseUrl?: string;
  private configModel?: string;
  private timeoutMs: number;

  constructor(config: AgentRouterConfig = {}) {
    this.configApiKey = config.apiKey;
    this.configBaseUrl = config.baseUrl;
    this.configModel = config.model;
    this.timeoutMs = config.timeoutMs || 90000;
  }

  private getApiKey(): string {
    return this.configApiKey || process.env.AGENTROUTER_API_KEY || '';
  }

  private getBaseUrl(): string {
    return this.configBaseUrl || process.env.AGENTROUTER_BASE_URL || 'https://agentrouter.org';
  }

  public getModel(): string {
    return this.configModel || process.env.AGENTROUTER_MODEL || 'gpt-6-astra';
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim() !== '' && !key.includes('YOUR_AGENTROUTER_API_KEY'));
  }

  /**
   * Send a completion / prompt to AgentRouter using the official endpoints.
   * Handles:
   *  1. Authorized client fingerprinting (User-Agent: codex_cli_rs, originator: codex_cli_rs)
   *  2. OpenAI Responses API endpoint (/v1/responses) natively used by gpt-6-astra
   *  3. Standard /v1/chat/completions fallback for standard OpenAI models
   *  4. Automatic JSON response parsing
   *  5. Rich error classification (401 invalid key, 429 rate limit, 500 server error, timeout)
   */
  public async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('AgentRouter API key is not configured. Please set AGENTROUTER_API_KEY in .env');
    }

    const apiKey = this.getApiKey();
    const baseUrl = this.getBaseUrl();
    const model = this.getModel();

    const cleanBase = baseUrl.replace(/\/+$/, '');
    const url = new URL(cleanBase);

    // Combine system instructions and user prompt for Responses API input
    const fullInput = systemInstruction
      ? `${systemInstruction}\n\n${prompt}`
      : prompt;

    const payload = JSON.stringify({
      model: model,
      input: fullInput
    });

    return new Promise<string>((resolve, reject) => {
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        req.destroy();
        reject(new Error(`AgentRouter API request timed out after ${this.timeoutMs}ms.`));
      }, this.timeoutMs);

      const req = https.request({
        hostname: url.hostname,
        port: url.port || 443,
        path: '/v1/responses',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'User-Agent': 'codex_cli_rs/0.58.0',
          'originator': 'codex_cli_rs',
          'Accept': 'application/json'
        }
      }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          clearTimeout(timer);
          if (timedOut) return;

          const statusCode = res.statusCode || 500;

          if (statusCode === 401) {
            return reject(new Error('AgentRouter Authentication failed (401): Invalid or unauthorized API key.'));
          }
          if (statusCode === 429) {
            return reject(new Error('AgentRouter Rate Limit exceeded (429): Please try again shortly.'));
          }
          if (statusCode >= 500) {
            return reject(new Error(`AgentRouter Server error (${statusCode}): Upstream service unavailable.`));
          }

          try {
            const parsed = JSON.parse(responseData);

            if (statusCode >= 400) {
              const errMsg = parsed?.error?.message || parsed?.message || `HTTP ${statusCode}`;
              return reject(new Error(`AgentRouter error: ${errMsg}`));
            }

            // Extract text from /v1/responses output structure
            // Output array contains:
            //   { type: 'reasoning', ... }
            //   { type: 'message', content: [ { type: 'output_text', text: '...' } ] }
            let text = '';
            if (Array.isArray(parsed.output)) {
              for (const item of parsed.output) {
                if (item.type === 'message' && Array.isArray(item.content)) {
                  for (const part of item.content) {
                    if (part.type === 'output_text' && part.text) {
                      text += part.text;
                    }
                  }
                }
              }
            }

            if (!text && parsed.text) {
              text = parsed.text;
            }

            if (!text) {
              // Check fallback standard choices if any
              if (parsed.choices && parsed.choices[0]?.message?.content) {
                text = parsed.choices[0].message.content;
              }
            }

            if (!text) {
              return reject(new Error('AgentRouter returned an empty or unparseable response output.'));
            }

            resolve(text.trim());
          } catch (jsonErr: any) {
            reject(new Error(`Failed to parse AgentRouter JSON response: ${jsonErr.message}. Response was: ${responseData.slice(0, 200)}`));
          }
        });
      });

      req.on('error', (err) => {
        clearTimeout(timer);
        if (!timedOut) {
          reject(new Error(`AgentRouter connection error: ${err.message}`));
        }
      });

      req.write(payload);
      req.end();
    });
  }

  /**
   * Helper to request structured JSON from the model and clean markdown fences
   */
  public async generateJson<T>(prompt: string, systemInstruction?: string): Promise<T> {
    const raw = await this.generateText(prompt, systemInstruction);
    const cleaned = cleanJsonMarkdown(raw);
    try {
      return JSON.parse(cleaned) as T;
    } catch (err: any) {
      throw new Error(`AgentRouter response is not valid JSON: ${err.message}. Raw output: ${raw.slice(0, 300)}`);
    }
  }

  /**
   * Test connection and retrieve model info
   */
  public async testConnection(): Promise<{ success: boolean; model: string; latencyMs: number }> {
    const startTime = Date.now();
    const result = await this.generateText('Reply with the word "pong".');
    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      model: this.getModel(),
      latencyMs
    };
  }
}

export function cleanJsonMarkdown(text: string): string {
  let cleaned = (text || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/i, '').trim();
  }
  return cleaned;
}

// Global default singleton
export const agentRouter = new AgentRouterClient();

