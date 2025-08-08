import React from "react";
import { Refine } from "@refinedev/core";
import { ThemedLayoutV2, notificationProvider } from "@refinedev/antd";
import routerBindings from "@refinedev/react-router-v6";
import { ConfigProvider, theme as antdTheme } from "antd";
import { Routes, Route, Navigate } from "react-router-dom";
import "antd/dist/reset.css";

import { adminAuthProvider } from "./providers/authProvider";
import { dummyDataProvider } from "./providers/dummyDataProvider";

import { RefineAccountsPage } from "./resources/accounts/RefineAccountsPage";
import { RefineAccountDetailPage } from "./resources/accounts/RefineAccountDetailPage";

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
            <Route index element={<Navigate to="/admin/accounts" replace />} />
            <Route path="accounts" element={<RefineAccountsPage />} />
            <Route path="accounts/:id" element={<RefineAccountDetailPage />} />
          </Routes>
        </ThemedLayoutV2>
      </Refine>
    </ConfigProvider>
  );
};

