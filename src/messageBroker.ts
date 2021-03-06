import amqp from 'amqplib';

export interface MessageBroker {
  sendMessage(message: string): void;
}

export class RabbitMQMessageBroker implements MessageBroker {
  conn: any;

  constructor() {
    this.conn = amqp.connect('amqp://localhost');
  }

  sendMessage(msg: string) {
    this.conn
      .then((connection: any) => {
        return connection.createChannel();
      })
      .then((ch: any) => {
        ch.sendToQueue('hello', Buffer.from(msg));
      });
  }
}
