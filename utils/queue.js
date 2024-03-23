import Queue from 'bull'
import uploadFileToCloud from '../services/cloudStorage.js'

const uploadQueue = new Queue('upload', {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
})

uploadQueue.process('upload', async (job, done) => {
  try {
    job?.data?.forEach((file) => {
      uploadFileToCloud(file)
    })
    done()
  } catch (error) {
    console.log('upload failed')
  }
})

export default uploadQueue
