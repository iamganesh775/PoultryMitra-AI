import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';

const client = new PollyClient({ region: process.env.AWS_REGION });

export interface VoiceConfig {
  voiceId: string;
  languageCode: string;
  engine?: 'standard' | 'neural';
}

/**
 * Synthesize speech from text using Amazon Polly
 */
export const synthesizeSpeech = async (
  text: string,
  config: VoiceConfig
): Promise<Uint8Array> => {
  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: config.voiceId,
    LanguageCode: config.languageCode,
    Engine: config.engine || 'neural',
  });

  const response = await client.send(command);
  
  if (!response.AudioStream) {
    throw new Error('No audio stream returned from Polly');
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.AudioStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

/**
 * Get voice configuration for language
 */
export const getVoiceForLanguage = (language: string): VoiceConfig => {
  const voices: Record<string, VoiceConfig> = {
    'en': { voiceId: 'Joanna', languageCode: 'en-US', engine: 'neural' },
    'hi': { voiceId: 'Aditi', languageCode: 'hi-IN', engine: 'standard' },
    'te': { voiceId: 'Aditi', languageCode: 'hi-IN', engine: 'standard' },
    'es': { voiceId: 'Lucia', languageCode: 'es-ES', engine: 'neural' },
  };

  return voices[language] || voices['en'];
};
