import { getChannel } from './connection';

export const publishProductUpdated = async (message: any) => {
    const channel = getChannel();
    const queue = 'product_updated';
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  };
  
  export const publishProductAdded = async (message: any) => {
    try {
      const channel = getChannel();
      const queue = 'product_added';
  
      await channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
      console.log('Published product add event:', message);
    } catch (error) {
      console.error('Error publishing product add event:', error);
    }
  };

  export const publishProductDeleted = async (message: any) => {
    try {
      const channel = getChannel();
      const queue = 'product_deleted';
  
      await channel.assertQueue(queue, { durable: true });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
      console.log('Published product delete event:', message);
    } catch (error) {
      console.error('Error publishing product delete event:', error);
    }
  };