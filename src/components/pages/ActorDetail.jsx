import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, ArrowLeft, Tv } from 'lucide-react';

const ActorDetail = () => {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [tvShows, setTvShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActorDetails();
  }, [id]);

  const loadActorDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [actorResponse, tvShowsResponse] = await Promise.all([
        apiService.getActor(id),
        apiService.getActorTVShows(id)
      ]);
      
      setActor(actorResponse.actor);
      setTvShows(tvShowsResponse.tv_shows || []);
    } catch (error) {
      setError('Failed to load actor details. Please try again.');
      console.error('Failed to load actor details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Actor not found'}</p>
        <Link to="/actors">
          <Button>Back to Actors</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/actors">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Actors
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="w-full aspect-square bg-gray-200 rounded-lg overflow-hidden">
            {actor.profile_image_url ? (
              <img 
                src={actor.profile_image_url} 
                alt={actor.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h1 className="text-4xl font-bold">{actor.name}</h1>
          
          {actor.birth_date && (
            <p className="text-lg text-gray-600">
              Born: {new Date(actor.birth_date).toLocaleDateString()}
            </p>
          )}

          {actor.biography && (
            <p className="text-lg text-gray-700 leading-relaxed">
              {actor.biography}
            </p>
          )}

          <div>
            <h2 className="text-2xl font-bold mb-4">TV Shows ({tvShows.length})</h2>
            {tvShows.length === 0 ? (
              <p className="text-gray-600">No TV shows found.</p>
            ) : (
              <div className="grid gap-4">
                {tvShows.map((tvShowRel) => (
                  <Card key={tvShowRel.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                          {tvShowRel.tv_show?.poster_url ? (
                            <img 
                              src={tvShowRel.tv_show.poster_url} 
                              alt={tvShowRel.tv_show.title}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tv className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Link 
                            to={`/tvshows/${tvShowRel.tv_show_id}`}
                            className="font-semibold text-lg hover:text-blue-600 transition-colors"
                          >
                            {tvShowRel.tv_show?.title}
                          </Link>
                          {tvShowRel.role && (
                            <p className="text-gray-600">as {tvShowRel.role}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorDetail;

