import { openai } from '@ai-sdk/openai';
import { streamText, StreamData } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const prompt = "Create a list of three open-ended and engaging questions and engaging questions formatted as a single string .Each question should be swparated by '||' .These questions are for an anonymous social messaging platform,like Qooh.me, and should be suitable for a diverse audience .Avoid universal themes that encourage friendly interactions .For example, your output should be structured like this: 'What's hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'.Ensure the questions are intriguing ,foster curiosity ,and contribute to a positive and welcoming conversational environment"

    const data = new StreamData();
    data.append({ test: 'value' });

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      maxTokens:200,
      prompt,
      temperature: 0.7,
      onFinish() {
        data.close();
      },
    });

    return result.toDataStreamResponse({ data });
  } catch (error) {
    console.error('Error:', error);
    return new Response('An error occurred', { status: 500 });
  }
}