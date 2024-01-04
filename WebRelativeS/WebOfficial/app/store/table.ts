import { TableClient } from "@azure/data-tables"
import baseConfig from '../lib/config'

export default async (tableName:string):Promise<any> => {
  const AZURE_STORAGE_CONNECTION_STRING:string = baseConfig.azureStorage[process.env.MODE?.trim() === 'test' ? 'dev' : 'prod']
  return TableClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING, tableName);
}

