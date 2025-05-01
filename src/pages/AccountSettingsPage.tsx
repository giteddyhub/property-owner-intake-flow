
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bell, Shield, User } from 'lucide-react';

type SettingsSection = 'profile' | 'notifications' | 'security';

const AccountSettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would update the user's profile in Supabase
      // For now we'll just show a success message
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was a problem updating your profile.',
        type: 'error', // Changed from 'variant: "destructive"' to 'type: "error"'
      });
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateNotifications = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      toast({
        title: 'Notification preferences updated',
        description: 'Your notification preferences have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was a problem updating your notification preferences.',
        type: 'error',
      });
      console.error('Error updating notification preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateSecurity = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    try {
      toast({
        title: 'Security settings updated',
        description: 'Your security settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was a problem updating your security settings.',
        type: 'error',
      });
      console.error('Error updating security settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information and how it appears on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Your email address is used for login and cannot be changed here.
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );
        
      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateNotifications}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about your account activity
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className={`px-3 py-1 text-sm rounded-md ${
                          true ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        On
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1 text-sm rounded-md ${
                          false ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tax Filing Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about important tax filing dates and changes
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className={`px-3 py-1 text-sm rounded-md ${
                          true ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        On
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1 text-sm rounded-md ${
                          false ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Communications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new services and promotions
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className={`px-3 py-1 text-sm rounded-md ${
                          false ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        On
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1 text-sm rounded-md ${
                          true ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );
        
      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your password and account security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSecurity}>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Password Requirements:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-5">
                      <li>Minimum 8 characters</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one number</li>
                      <li>At least one special character</li>
                    </ul>
                  </div>
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardHeader onSignOut={handleSignOut} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToDashboard}
            className="flex items-center text-gray-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr]">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-normal ${activeSection === 'profile' ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={() => setActiveSection('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-normal ${activeSection === 'notifications' ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={() => setActiveSection('notifications')}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start font-normal ${activeSection === 'security' ? 'bg-accent text-accent-foreground' : ''}`}
                  onClick={() => setActiveSection('security')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </Button>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            {renderSectionContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountSettingsPage;
