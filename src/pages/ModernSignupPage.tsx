
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import { useImprovedSignUpForm } from '@/hooks/useImprovedSignUpForm';
import { AnimatedBackground } from '@/components/ui/animated-background';

export const ModernSignupPage: React.FC = () => {
  const { formState, updateField, handleSubmit } = useImprovedSignUpForm({
    redirectAfterAuth: true
  });

  if (formState.isSignedUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
        {/* Left side - Success message */}
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md shadow-xl">
            <CardContent className="pt-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
                  <p className="text-gray-600">
                    Please check your email to verify your account, then you'll be redirected to your dashboard to complete your property information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - Animated background */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
          <AnimatedBackground />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left side - Signup form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 pb-8">
            <CardTitle className="text-3xl font-bold text-center text-gray-900">
              Create Account
            </CardTitle>
            <p className="text-center text-gray-600">
              Start managing your Italian properties today
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formState.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    disabled={formState.isSubmitting}
                    className="h-12"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formState.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    disabled={formState.isSubmitting}
                    className="h-12"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formState.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    disabled={formState.isSubmitting}
                    className="h-12"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-lg"
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Animated background */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
        <AnimatedBackground />
        
        {/* Decorative static elements for extra visual interest */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/5 rounded-full"></div>
      </div>
    </div>
  );
};
