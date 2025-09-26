import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv, Users, Heart, Star, TrendingUp } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredShows, setFeaturedShows] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, [isAuthenticated]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load featured shows (top rated)
      const showsResponse = await apiService.getTVShows({
        sort_by: 'rating',
        sort_order: 'desc',
        per_page: 6
      });
      setFeaturedShows(showsResponse.tv_shows || []);

      // Load recommendations if authenticated
      if (isAuthenticated) {
        try {
          const recsResponse = await apiService.getRecommendations({ per_page: 4 });
          setRecommendations(recsResponse.recommendations || []);
        } catch (error) {
          console.error('Failed to load recommendations:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, description, value }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  const ShowCard = ({ show }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[2/3] bg-gray-200 relative">
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
            <Tv className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {show.rating && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">
            <Star className="h-3 w-3 mr-1" />
            {show.rating}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{show.title}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{show.description}</p>
        <div className="flex justify-between items-center">
          <Badge variant="secondary">{show.genre}</Badge>
          <Link to={`/tvshows/${show.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Discover Amazing TV Shows
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Track your favorite series, discover new ones, and never miss an episode
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/tvshows">
            <Button size="lg" variant="secondary">
              Browse TV Shows
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Tv}
          title="TV Shows"
          description="Available in our database"
          value="1000+"
        />
        <StatCard
          icon={Users}
          title="Actors"
          description="Featured performers"
          value="5000+"
        />
        <StatCard
          icon={Heart}
          title="User Favorites"
          description="Shows loved by users"
          value="10K+"
        />
      </section>

      {/* Recommendations Section (for authenticated users) */}
      {isAuthenticated && recommendations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center">
              <TrendingUp className="h-8 w-8 mr-2 text-blue-600" />
              Recommended for You
            </h2>
            <Link to="/tvshows">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Shows Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold flex items-center">
            <Star className="h-8 w-8 mr-2 text-yellow-500" />
            Top Rated Shows
          </h2>
          <Link to="/tvshows">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {featuredShows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="text-center py-12 bg-gray-100 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Tracking?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Join thousands of users who are already tracking their favorite shows
          </p>
          <Link to="/register">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </section>
      )}
    </div>
  );
};

export default Home;

