import { BlobServiceClient } from '@azure/storage-blob'
import baseConfig from '../lib/config'

export default async (containerName: string | void): Promise<any> =>  {
  const AZURE_STORAGE_CONNECTION_STRING:string = baseConfig.azureStorage[process.env.MODE?.trim() === 'test' ? 'dev' : 'prod']
  const blobServiceClient:any = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
  const container = containerName || baseConfig.azureContainerName
  return await blobServiceClient.getContainerClient(container)
}