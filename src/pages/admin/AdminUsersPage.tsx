
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminActionButton, AccountAdminDialog } from '@/components/admin/accounts/AccountAdminDialog';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Fetch users and admin data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        console.log('[AdminUsers] Fetching profiles data');
        // Fetch all users from profiles table
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, email, full_name, created_at')
          .order('created_at', { ascending: false });
          
        if (userError) throw userError;
        
        console.log('[AdminUsers] Fetching admin data');
        // Fetch admin users directly without using any function that might cause recursion
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id');
          
        if (adminError) {
          console.error('[AdminUsers] Error fetching admin users:', adminError);
          throw adminError;
        }
        
        console.log('[AdminUsers] Admin users found:', adminData?.length || 0);
        setUsers(userData || []);
        setAdminUsers(adminData?.map(admin => admin.id) || []);
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const createAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    
    try {
      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }
      
      // 2. Give the user admin privileges
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert([{ id: authData.user.id }]);
        
      if (adminError) throw adminError;
      
      // Success
      toast.success(`Admin user ${fullName} created successfully`);
      setFormOpen(false);
      
      // Refresh the user list
      setUsers(prev => [
        { id: authData.user.id, email: authData.user.email, full_name: fullName },
        ...prev
      ]);
      setAdminUsers(prev => [...prev, authData.user.id]);
      
      // Reset form
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      setFormError(error.message || 'Failed to create admin user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAdminDialog = (user: any) => {
    setSelectedUser(user);
    setAdminDialogOpen(true);
  };

  const handleToggleAdmin = async () => {
    if (!selectedUser) return;
    
    const userId = selectedUser.id;
    const isAdmin = adminUsers.includes(userId);
    const userName = selectedUser.full_name || selectedUser.email;
    
    try {
      if (isAdmin) {
        // Remove admin privileges
        console.log('[AdminUsers] Removing admin privileges for:', userId);
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', userId);
          
        if (error) throw error;
        
        setAdminUsers(prev => prev.filter(id => id !== userId));
        toast.success(`Admin privileges removed from ${userName}`);
      } else {
        // Grant admin privileges
        console.log('[AdminUsers] Granting admin privileges for:', userId);
        const { error } = await supabase
          .from('admin_users')
          .insert([{ id: userId }]);
          
        if (error) throw error;
        
        setAdminUsers(prev => [...prev, userId]);
        toast.success(`Admin privileges granted to ${userName}`);
      }
      
      setAdminDialogOpen(false);
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  return (
    <AdminLayout pageTitle="Users">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">User Management</h2>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Admin User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Administrator Account</DialogTitle>
                <DialogDescription>
                  Create a new user account with administrative privileges.
                </DialogDescription>
              </DialogHeader>
              
              {formError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={createAdminUser}>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                </div>
                
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Admin User'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found in the system
              </div>
            ) : (
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Role</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const isAdmin = adminUsers.includes(user.id);
                      
                      return (
                        <tr key={user.id} className="border-t">
                          <td className="p-3">{user.full_name || 'No Name'}</td>
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">
                            {isAdmin ? (
                              <span className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Admin
                              </span>
                            ) : (
                              <span className="text-muted-foreground">User</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <AdminActionButton 
                              isAdmin={isAdmin}
                              onClick={() => handleOpenAdminDialog(user)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {selectedUser && (
        <AccountAdminDialog
          open={adminDialogOpen}
          onOpenChange={setAdminDialogOpen}
          onConfirm={handleToggleAdmin}
          accountName={selectedUser.full_name || selectedUser.email}
          isAdmin={adminUsers.includes(selectedUser.id)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;
