import { getChannel } from './connection';

const EXCHANGE_NAME = 'filter_service_exchange';

export enum EventType {
  CREATE_FILTER = 'filter.create',
  UPDATE_FILTER = 'filter.update',
  DELETE_FILTER = 'filter.delete',
  CREATE_FILTER_VALUE = 'filterValue.create',
  UPDATE_FILTER_VALUE = 'filterValue.update',
  DELETE_FILTER_VALUE = 'filterValue.delete',
  CREATE_PRODUCT_FILTER = 'productFilter.create',
}

export interface EventMessage {
  eventType: EventType;
  timestamp: string;
  data: any;
}

export async function publishEvent(eventType: EventType, data: any) {
  try {
    const channel = getChannel();

    const message: EventMessage = {
      eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    const messageBuffer = Buffer.from(JSON.stringify(message));

    const published = channel.publish(
      EXCHANGE_NAME,
      '',          
      messageBuffer, 
      { persistent: true }
    );

    if (published) {
      console.log(`Published event: ${eventType}`);
    } else {
      console.warn(`Failed to publish event: ${eventType}`);
    }
  } catch (error) {
    console.error('Error publishing event:', error);
  }
}
