
import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Home, ClipboardList, FileText } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    propertyCount: 0,
    submissionCount: 0,
    ownerCount: 0
  });
  
  const [submissionData, setSubmissionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch counts
        const [
          { count: userCount }, 
          { count: propertyCount }, 
          { count: submissionCount },
          { count: ownerCount }
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('properties').select('id', { count: 'exact', head: true }),
          supabase.from('form_submissions').select('id', { count: 'exact', head: true }),
          supabase.from('owners').select('id', { count: 'exact', head: true })
        ]);
        
        // Update stats
        setStats({
          userCount: userCount || 0,
          propertyCount: propertyCount || 0,
          submissionCount: submissionCount || 0,
          ownerCount: ownerCount || 0
        });
        
        // Generate some mock chart data
        const today = new Date();
        const mockData = [];
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          
          mockData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            submissions: Math.floor(Math.random() * 5),
            users: Math.floor(Math.random() * 3)
          });
        }
        
        setSubmissionData(mockData);
        
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <AdminLayout pageTitle="Dashboard Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
                <h2 className="text-3xl font-bold">{stats.userCount}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Properties</p>
                <h2 className="text-3xl font-bold">{stats.propertyCount}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <Home className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Submissions</p>
                <h2 className="text-3xl font-bold">{stats.submissionCount}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Owners</p>
                <h2 className="text-3xl font-bold">{stats.ownerCount}</h2>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Submissions and new user registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={submissionData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  name="Submissions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="New Users"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
