import React from "react";
import { Refine } from "@refinedev/core";
import { ThemedLayoutV2, notificationProvider } from "@refinedev/antd";
import routerBindings from "@refinedev/react-router-v6";
import { ConfigProvider, theme as antdTheme } from "antd";
import { Routes, Route, Navigate } from "react-router-dom";
import "antd/dist/reset.css";

import { adminAuthProvider } from "./providers/authProvider";
import { dummyDataProvider } from "./providers/dummyDataProvider";
import { UsersList } from "./resources/users/UsersList";
import AdminAccountsPage from "@/pages/admin/AdminAccountsPage";
import AdminAccountDetailPage from "@/pages/admin/AdminAccountDetailPage";

export const RefineAdminApp: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          // Keep visuals subtle to blend with existing design system
          borderRadius: 8,
        },
      }}
    >
      <Refine
        dataProvider={dummyDataProvider}
        authProvider={adminAuthProvider}
        routerProvider={routerBindings}
        notificationProvider={notificationProvider}
        resources={[
          { name: "users", list: "/users", meta: { label: "Users" } },
          { name: "accounts", list: "/accounts", meta: { label: "Accounts" } },
        ]}
        options={{
          syncWithLocation: true,
          warnWhenUnsavedChanges: true,
          projectId: "admin-refine",
        }}
      >
        <ThemedLayoutV2>
          <Routes>
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<UsersList />} />
            <Route path="accounts" element={<AdminAccountsPage />} />
            <Route path="accounts/:id" element={<AdminAccountDetailPage />} />
          </Routes>
        </ThemedLayoutV2>
      </Refine>
    </ConfigProvider>
  );
};

