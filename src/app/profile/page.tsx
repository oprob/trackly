'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Shield, LogOut, Save, Edit2 } from 'lucide-react';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user || !displayName.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      await updateProfile(user, {
        displayName: displayName.trim()
      });
      setIsEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.displayName || user.email || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">
                      {user.displayName || 'No name set'}
                    </h3>
                    <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.emailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Display Name Edit */}
              <div className="space-y-3">
                <Label htmlFor="displayName">Display Name</Label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleUpdateProfile}
                      disabled={loading || !displayName.trim()}
                      size="sm"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user.displayName || '');
                      }}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {user.displayName || 'No name set'}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              {/* Account Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Account Created
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(user.metadata?.creationTime || null)}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Last Sign In
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(user.metadata?.lastSignInTime || null)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Success/Error Message */}
              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Update Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md">
                    {success}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Sign Out</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign out of your account on this device.
                  </p>
                  <Button variant="outline" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <Button variant="destructive" disabled>
                    Delete Account (Coming Soon)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}