import { getChannel } from './connection';
import { updateStock } from '../services/productService';

export const consumeStockUpdates = async () => {
  const channel = getChannel();
  const queue = 'stock_updated';

  await channel.assertQueue(queue, { durable: true });
  channel.consume(queue, async (message) => {
    if (message) {
      try {
        const stockUpdate = JSON.parse(message.content.toString());
        console.log('Received stock update:', stockUpdate);

        await updateStock(stockUpdate.productId, stockUpdate.newStock);

        channel.ack(message);
      } catch (error) {
        console.error('Error processing stock update:', error);
        channel.nack(message, false, false);
      }
    }
  });

  console.log('Listening for stock updates...');
};

