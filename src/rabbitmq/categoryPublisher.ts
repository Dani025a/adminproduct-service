
import { getChannel } from './connection';


export async function categoryPublisher(queueName: string, message: any) {
  try {
    const channel = getChannel();
    if (!channel) {
      throw new Error('RabbitMQ channel is not initialized.');
    }

    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log(`Message sent to queue "${queueName}":`, message);
  } catch (error) {
    console.error('Error publishing message to RabbitMQ:', error);
  }
}