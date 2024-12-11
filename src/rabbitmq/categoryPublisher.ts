import { getChannel } from './connection';

export async function categoryPublisher(queue: string, message: any) {
  const channel = getChannel();

  if (!channel) {
    console.error('RabbitMQ channel is not available');
    return;
  }

  const msg = JSON.stringify(message);
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(msg));
  console.log(`Message sent to queue ${queue}:`, message);
}
