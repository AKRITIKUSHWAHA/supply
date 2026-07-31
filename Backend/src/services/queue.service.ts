import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

// Create Queues
export const importQueue = new Queue('ImportQueue', { connection });
export const syncQueue = new Queue('SyncQueue', { connection });
export const publishQueue = new Queue('PublishQueue', { connection });
export const validationQueue = new Queue('ValidationQueue', { connection });

// Initialize Workers
export const initWorkers = () => {
  const syncWorker = new Worker('SyncQueue', async (job: Job) => {
    console.log(`Processing Sync Job: ${job.id}`);
    // Simulated sync logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { status: 'success', synced: true };
  }, { connection });

  const publishWorker = new Worker('PublishQueue', async (job: Job) => {
    console.log(`Processing Publish Job: ${job.id}`);
    // Simulated publish logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { status: 'success', published: true };
  }, { connection });

  syncWorker.on('completed', job => console.log(`Sync Job \${job.id} completed.`));
  publishWorker.on('completed', job => console.log(`Publish Job \${job.id} completed.`));

  console.log('BullMQ Workers initialized.');
};
