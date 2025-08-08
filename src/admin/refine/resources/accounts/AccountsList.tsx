import React from "react";
import { Card, Button, Typography } from "antd";
import { Link } from "react-router-dom";

export const AccountsList: React.FC = () => {
  React.useEffect(() => {
    document.title = "Admin Accounts | Refine";
  }, []);

  return (
    <div className="space-y-4">
      <Card title="Accounts">
        <Typography.Paragraph>
          Accounts management in Refine is being migrated. For now, continue using the existing experience.
        </Typography.Paragraph>
        <Link to="/admin/users">
          <Button type="primary">Go to Users</Button>
        </Link>
      </Card>
    </div>
  );
};
