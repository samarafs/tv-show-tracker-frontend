import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Tv, Star, Trash2 } from 'lucide-react';

const Favorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getFavorites();
      setFavorites(response.favorites || []);
    } catch (error) {
      setError('Failed to load favorites. Please try again.');
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (tvShowId) => {
    try {
      await apiService.removeFavorite(tvShowId);
      setFavorites(prev => prev.filter(fav => fav.tv_show_id !== tvShowId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center">
        <Heart className="h-8 w-8 mr-2 text-red-500" />
        My Favorites
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadFavorites} className="mt-4">Try Again</Button>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">You haven't added any favorites yet.</p>
          <Link to="/tvshows">
            <Button>Browse TV Shows</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(favorite => (
            <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-[2/3] bg-gray-200 relative">
                {favorite.tv_show?.poster_url ? (
                  <img 
                    src={favorite.tv_show.poster_url} 
                    alt={favorite.tv_show.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tv className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {favorite.tv_show?.rating && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500">
                    <Star className="h-3 w-3 mr-1" />
                    {favorite.tv_show.rating}
                  </Badge>
                )}
                
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => removeFavorite(favorite.tv_show_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {favorite.tv_show?.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {favorite.tv_show?.description}
                </p>
                
                <div className="flex justify-between items-center mb-3">
                  <Badge variant="secondary">{favorite.tv_show?.genre}</Badge>
                  <Badge variant="outline">{favorite.tv_show?.status}</Badge>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">
                  Added: {new Date(favorite.added_at).toLocaleDateString()}
                </p>
                
                <Link to={`/tvshows/${favorite.tv_show_id}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;

