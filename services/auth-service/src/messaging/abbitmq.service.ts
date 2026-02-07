import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import * as amqp from 'amqplib';
import { eventNames } from "process";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMQService.name);
    
    private connection!: amqp.ChannelModel;
    private channel!: amqp.Channel;

    private readonly exchange = process.env.RABBITMQ_EXCHANGE!;
    private readonly url = process.env.RABBITMQ_URL!;


    async onModuleInit() {
        try {
            this.logger.log('Connecting to RabbitMQ ...')

            this.connection = await amqp.connect(this.url)
            this.channel = await this.connection.createChannel()
            try {
                await this.channel.checkExchange(this.exchange);
                this.logger.log(`Exchange "${this.exchange}" already exists`);
            } catch (error) {
                await this.channel.assertExchange(this.exchange, 'topic', {
                    durable: true,
                    // autoDelete: false,
                })
                this.logger.log('RabbitMQ Connected')
            }
        } catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
            throw error;
        } 

    }
    async onModuleDestroy() {
        this.logger.log("Closing RabbitMQ Connection ...")
        if(this.channel){
            await this.channel.close()
        }
        if(this.connection){
            await this.connection.close()
        }
        
        this.logger.log('RabbitMQ connection closed');

    }
    async emit(event: string, payload: Record<string, any>){
        const message = Buffer.from(
            JSON.stringify({
            event,
            payload,
            timeStmp: new Date().toDateString()
        }))
        this.channel.publish(this.exchange, event, message, {
            persistent: true,
        }
        )

        this.logger.log(`Evetnt Emitted -> ${event}`)
    }

}