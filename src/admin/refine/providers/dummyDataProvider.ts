import { DataProvider } from "@refinedev/core";

// Minimal placeholder data provider. Our resources use custom pages/hooks for now.
export const dummyDataProvider: DataProvider = {
  getList: async () => ({ data: [], total: 0 }),
  getOne: async () => ({ data: {} as any }),
  getMany: async () => ({ data: [] }),
  create: async ({ variables }) => ({ data: variables as any }),
  update: async ({ variables }) => ({ data: variables as any }),
  deleteOne: async () => ({ data: {} as any }),
  getApiUrl: () => "/",
  // Optional methods
  createMany: async ({ variables }) => ({ data: variables as any }),
  updateMany: async ({ variables }) => ({ data: variables as any }),
  deleteMany: async () => ({ data: [] }),
  custom: async () => ({ data: {} as any }),
};
