
export interface ActivityLogData {
  userId: string;
  activityType: string;
  activityDescription: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
}
