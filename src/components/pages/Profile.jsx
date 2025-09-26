import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Download, Trash2 } from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email_notifications: true
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email_notifications: user.email_notifications || false
      });
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await apiService.getUserStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const blob = await apiService.exportUserDataCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${user.username}_favorites.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold flex items-center">
        <User className="h-8 w-8 mr-2 text-blue-600" />
        Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email_notifications"
                  name="email_notifications"
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, email_notifications: checked })
                  }
                />
                <Label htmlFor="email_notifications">
                  Receive email notifications
                </Label>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">{stats.total_favorites}</p>
                  <p className="text-gray-600">Favorite TV Shows</p>
                </div>
                
                {stats.member_since && (
                  <div>
                    <p className="text-lg font-semibold">
                      {new Date(stats.member_since).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">Member Since</p>
                  </div>
                )}

                {stats.top_genres && stats.top_genres.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">Top Genres:</p>
                    <div className="space-y-1">
                      {stats.top_genres.map((genre, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{genre.genre}</span>
                          <span className="text-gray-600">{genre.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Loading statistics...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Export Your Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Download your favorites and account data in CSV format.
            </p>
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2 text-red-600">Danger Zone</h3>
            <p className="text-sm text-gray-600 mb-3">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="destructive" disabled>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
            <p className="text-xs text-gray-500 mt-1">
              Account deletion is currently disabled in this demo.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

