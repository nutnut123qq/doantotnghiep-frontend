export enum DataSourceType {
  News = 1,
  Stock = 2,
  FinancialReport = 3,
  Event = 4,
}

export enum ConnectionStatus {
  Unknown = 0,
  Connected = 1,
  Disconnected = 2,
  Error = 3,
}

export interface DataSource {
  id: string
  name: string
  type: DataSourceType
  url: string
  apiKey?: string
  isActive: boolean
  status: ConnectionStatus
  lastChecked?: string
  errorMessage?: string
  config?: string
  createdAt: string
  updatedAt: string
}

export const DATA_SOURCE_TYPE_LABELS: Record<DataSourceType, string> = {
  [DataSourceType.News]: 'News',
  [DataSourceType.Stock]: 'Stock',
  [DataSourceType.FinancialReport]: 'Financial Report',
  [DataSourceType.Event]: 'Event',
}

export const CONNECTION_STATUS_LABELS: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Unknown]: 'Unknown',
  [ConnectionStatus.Connected]: 'Connected',
  [ConnectionStatus.Disconnected]: 'Disconnected',
  [ConnectionStatus.Error]: 'Error',
}

export const CONNECTION_STATUS_COLORS: Record<ConnectionStatus, string> = {
  [ConnectionStatus.Unknown]: 'bg-slate-100 text-slate-600',
  [ConnectionStatus.Connected]: 'bg-emerald-100 text-emerald-700',
  [ConnectionStatus.Disconnected]: 'bg-red-100 text-red-700',
  [ConnectionStatus.Error]: 'bg-red-100 text-red-700',
}

