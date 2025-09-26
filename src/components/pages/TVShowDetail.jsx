import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tv, 
  Star, 
  Heart, 
  Calendar, 
  Clock, 
  Users,
  ArrowLeft
} from 'lucide-react';

const TVShowDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadShowDetails();
  }, [id]);

  const loadShowDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [showResponse, episodesResponse, actorsResponse] = await Promise.all([
        apiService.getTVShow(id),
        apiService.getTVShowEpisodes(id),
        apiService.getTVShowActors(id)
      ]);
      
      setShow(showResponse.tv_show);
      setEpisodes(episodesResponse.episodes || []);
      setActors(actorsResponse.actors || []);
      
      // Check if it's in favorites
      if (isAuthenticated) {
        try {
          const favoritesResponse = await apiService.getFavorites();
          const favoriteIds = new Set(
            favoritesResponse.favorites?.map(fav => fav.tv_show_id) || []
          );
          setIsFavorite(favoriteIds.has(parseInt(id)));
        } catch (error) {
          console.error('Failed to check favorites:', error);
        }
      }
    } catch (error) {
      setError('Failed to load TV show details. Please try again.');
      console.error('Failed to load show details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) return;

    try {
      if (isFavorite) {
        await apiService.removeFavorite(id);
        setIsFavorite(false);
      } else {
        await apiService.addFavorite(id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'TV show not found'}</p>
        <Link to="/tvshows">
          <Button>Back to TV Shows</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/tvshows">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to TV Shows
        </Button>
      </Link>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Poster */}
        <div className="lg:col-span-1">
          <div className="aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden">
            {show.poster_url ? (
              <img 
                src={show.poster_url} 
                alt={show.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tv className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold">{show.title}</h1>
            {isAuthenticated && (
              <Button
                variant={isFavorite ? "default" : "outline"}
                onClick={toggleFavorite}
              >
                <Heart 
                  className={`h-4 w-4 mr-2 ${
                    isFavorite ? 'fill-current' : ''
                  }`} 
                />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-sm">
              {show.genre}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {show.type}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {show.status}
            </Badge>
            {show.rating && (
              <Badge className="bg-yellow-500 text-sm">
                <Star className="h-3 w-3 mr-1" />
                {show.rating}
              </Badge>
            )}
          </div>

          <p className="text-lg text-gray-700 leading-relaxed">
            {show.description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {show.release_date && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Released: {new Date(show.release_date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center">
              <Tv className="h-4 w-4 mr-2 text-gray-500" />
              <span>Episodes: {episodes.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="episodes" className="w-full">
        <TabsList>
          <TabsTrigger value="episodes">Episodes ({episodes.length})</TabsTrigger>
          <TabsTrigger value="cast">Cast ({actors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="episodes" className="space-y-4">
          {episodes.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No episodes available.</p>
          ) : (
            <div className="grid gap-4">
              {episodes.map((episode) => (
                <Card key={episode.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">
                        S{episode.season_number}E{episode.episode_number}: {episode.title}
                      </h3>
                      {episode.duration && (
                        <Badge variant="outline" className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {episode.duration}m
                        </Badge>
                      )}
                    </div>
                    {episode.description && (
                      <p className="text-gray-600 mb-2">{episode.description}</p>
                    )}
                    {episode.air_date && (
                      <p className="text-sm text-gray-500">
                        Aired: {new Date(episode.air_date).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cast" className="space-y-4">
          {actors.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No cast information available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actors.map((actorRel) => (
                <Card key={actorRel.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {actorRel.actor?.profile_image_url ? (
                          <img 
                            src={actorRel.actor.profile_image_url} 
                            alt={actorRel.actor.name}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Users className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Link 
                          to={`/actors/${actorRel.actor_id}`}
                          className="font-semibold hover:text-blue-600 transition-colors"
                        >
                          {actorRel.actor?.name}
                        </Link>
                        {actorRel.role && (
                          <p className="text-sm text-gray-600">as {actorRel.role}</p>
                        )}
                        {actorRel.is_main_cast && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Main Cast
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TVShowDetail;

