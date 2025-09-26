import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Tv, 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  Grid,
  List
} from 'lucide-react';

const TVShows = () => {
  const { isAuthenticated } = useAuth();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  
  // Filters and search
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    type: '',
    status: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    per_page: 12
  });
  
  const [genres, setGenres] = useState([]);
  const [types, setTypes] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadGenresAndTypes();
  }, []);

  useEffect(() => {
    loadShows();
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated]);

  const loadGenresAndTypes = async () => {
    try {
      const [genresResponse, typesResponse] = await Promise.all([
        apiService.getGenres(),
        apiService.getTypes()
      ]);
      setGenres(genresResponse.genres || []);
      setTypes(typesResponse.types || []);
    } catch (error) {
      console.error('Failed to load genres and types:', error);
    }
  };

  const loadShows = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getTVShows(filters);
      setShows(response.tv_shows || []);
      setPagination(response.pagination || {});
    } catch (error) {
      setError('Failed to load TV shows. Please try again.');
      console.error('Failed to load shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await apiService.getFavorites();
      const favoriteIds = new Set(
        response.favorites?.map(fav => fav.tv_show_id) || []
      );
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadShows();
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const toggleFavorite = async (showId) => {
    if (!isAuthenticated) return;

    try {
      if (favorites.has(showId)) {
        await apiService.removeFavorite(showId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(showId);
          return newFavorites;
        });
      } else {
        await apiService.addFavorite(showId);
        setFavorites(prev => new Set([...prev, showId]));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const ShowCard = ({ show }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <div className="aspect-[2/3] bg-gray-200 relative">
        {show.poster_url ? (
          <img 
            src={show.poster_url} 
            alt={show.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Rating Badge */}
        {show.rating && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">
            <Star className="h-3 w-3 mr-1" />
            {show.rating}
          </Badge>
        )}
        
        {/* Favorite Button */}
        {isAuthenticated && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(show.id);
            }}
          >
            <Heart 
              className={`h-4 w-4 ${
                favorites.has(show.id) ? 'fill-red-500 text-red-500' : ''
              }`} 
            />
          </Button>
        )}
        
        {/* Status Badge */}
        <Badge 
          variant="outline" 
          className="absolute bottom-2 left-2 bg-white/90"
        >
          {show.status}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{show.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{show.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <Badge variant="secondary">{show.genre}</Badge>
          <Badge variant="outline">{show.type}</Badge>
        </div>
        
        <Link to={`/tvshows/${show.id}`}>
          <Button className="w-full">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  );

  const ShowListItem = ({ show }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-28 bg-gray-200 rounded flex-shrink-0">
            {show.poster_url ? (
              <img 
                src={show.poster_url} 
                alt={show.title}
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
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{show.title}</h3>
              {isAuthenticated && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavorite(show.id)}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      favorites.has(show.id) ? 'fill-red-500 text-red-500' : ''
                    }`} 
                  />
                </Button>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{show.description}</p>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{show.genre}</Badge>
              <Badge variant="outline">{show.type}</Badge>
              <Badge variant="outline">{show.status}</Badge>
              {show.rating && (
                <Badge className="bg-yellow-500">
                  <Star className="h-3 w-3 mr-1" />
                  {show.rating}
                </Badge>
              )}
            </div>
            
            <Link to={`/tvshows/${show.id}`}>
              <Button size="sm">View Details</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <Tv className="h-8 w-8 mr-2 text-blue-600" />
          TV Shows
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input
                  placeholder="Search TV shows..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select 
                value={filters.genre} 
                onValueChange={(value) => handleFilterChange('genre', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genres</SelectItem>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.type} 
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={`${filters.sort_by}-${filters.sort_order}`}
                onValueChange={(value) => {
                  const [sort_by, sort_order] = value.split('-');
                  handleFilterChange('sort_by', sort_by);
                  handleFilterChange('sort_order', sort_order);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="rating-desc">Rating High-Low</SelectItem>
                  <SelectItem value="rating-asc">Rating Low-High</SelectItem>
                  <SelectItem value="release_date-desc">Newest First</SelectItem>
                  <SelectItem value="release_date-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadShows} className="mt-4">Try Again</Button>
        </div>
      ) : shows.length === 0 ? (
        <div className="text-center py-12">
          <Tv className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No TV shows found matching your criteria.</p>
        </div>
      ) : (
        <>
          {/* Shows Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {shows.map(show => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {shows.map(show => (
                <ShowListItem key={show.id} show={show} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TVShows;

