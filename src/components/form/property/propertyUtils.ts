
// This file re-exports all utility functions from the utils/ directory
// It's kept for backward compatibility with existing imports

export * from './utils/propertyTypes';
export * from './utils/activityUtils';
export * from './utils/occupancyUtils';
export * from './utils/propertyFactory';

// Note: getInitialOccupancyMonths has been renamed to:
// - initializeOccupancyData in propertyFactory.ts
// - getOccupancyData in occupancyUtils.ts
