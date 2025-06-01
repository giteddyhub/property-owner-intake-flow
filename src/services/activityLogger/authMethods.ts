
import { ActivityLoggerCore } from './core';

/**
 * Authentication-related activity logging methods
 */
export class AuthActivityLogger {
  static async logUserRegistration(userId: string, email: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'user_registration',
      activityDescription: 'User completed registration',
      entityType: 'user',
      entityId: userId,
      metadata: {
        email,
        registration_timestamp: new Date().toISOString(),
        source: 'signup_form'
      }
    });
  }

  static async logUserLogin(userId: string, email?: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'user_login',
      activityDescription: 'User logged in',
      entityType: 'session',
      metadata: {
        email,
        login_timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        source: 'login_form'
      }
    });
  }

  static async logProfileUpdate(userId: string, updatedFields: string[], email?: string): Promise<void> {
    await ActivityLoggerCore.log({
      userId,
      activityType: 'profile_updated',
      activityDescription: `Updated profile fields: ${updatedFields.join(', ')}`,
      entityType: 'profile',
      entityId: userId,
      metadata: {
        updated_fields: updatedFields,
        email,
        update_timestamp: new Date().toISOString()
      }
    });
  }
}
