import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { createResponse, createErrorResponse, getUserId } from '../../layers/common/utils';
import { invokeBedrockModel } from '../../layers/common/bedrock';
import { putItem } from '../../layers/common/dynamodb';

const pollyClient = new PollyClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * Voice Advisory Handler using Amazon Polly
 * Converts AI text responses to speech in multiple languages
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body || '{}');
    const { question, language = 'en' } = body;

    if (!question) {
      return createErrorResponse(400, 'Question is required');
    }

    // Get AI response from Bedrock
    const aiResponse = await invokeBedrockModel(
      [{ role: 'user', content: question }],
      'You are a poultry farming expert. Provide concise, practical advice suitable for voice output.'
    );

    // Select appropriate Polly voice based on language
    const voiceConfig = getVoiceConfig(language);

    // Synthesize speech using Polly
    const synthesizeCommand = new SynthesizeSpeechCommand({
      Text: aiResponse,
      OutputFormat: 'mp3',
      VoiceId: voiceConfig.voiceId,
      Engine: 'neural',
      LanguageCode: voiceConfig.languageCode,
    });

    const pollyResponse = await pollyClient.send(synthesizeCommand);

    // Upload audio to S3
    const audioKey = `voice-advisory/${userId}/${uuidv4()}.mp3`;
    const audioBuffer = await streamToBuffer(pollyResponse.AudioStream!);

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: audioKey,
      Body: audioBuffer,
      ContentType: 'audio/mpeg',
    }));

    // Generate presigned URL for audio access
    const audioUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: audioKey,
      }),
      { expiresIn: 3600 }
    );

    // Save interaction
    await putItem('voice-interactions', {
      id: uuidv4(),
      userId,
      question,
      response: aiResponse,
      audioKey,
      language,
      timestamp: new Date().toISOString(),
    });

    return createResponse(200, {
      text: aiResponse,
      audioUrl,
      language,
      voiceId: voiceConfig.voiceId,
    });
  } catch (error) {
    console.error('Error in voice advisory handler:', error);
    return createErrorResponse(500, 'Failed to generate voice response');
  }
};

/**
 * Get voice configuration based on language
 */
function getVoiceConfig(language: string) {
  const configs: Record<string, { voiceId: string; languageCode: string }> = {
    en: { voiceId: 'Joanna', languageCode: 'en-US' },
    hi: { voiceId: 'Aditi', languageCode: 'hi-IN' },
    te: { voiceId: 'Aditi', languageCode: 'hi-IN' }, // Fallback to Hindi
  };
  return configs[language] || configs.en;
}

/**
 * Convert stream to buffer
 */
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
