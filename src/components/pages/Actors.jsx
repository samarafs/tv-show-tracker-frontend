import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const Actors = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadActors();
  }, [page]);

  const loadActors = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = { page, per_page: 12 };
      if (search) {
        params.search = search;
      }
      
      const response = await apiService.getActors(params);
      setActors(response.actors || []);
      setPagination(response.pagination || {});
    } catch (error) {
      setError('Failed to load actors. Please try again.');
      console.error('Failed to load actors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadActors();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold flex items-center">
        <Users className="h-8 w-8 mr-2 text-blue-600" />
        Actors
      </h1>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search actors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
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
          <Button onClick={loadActors} className="mt-4">Try Again</Button>
        </div>
      ) : actors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No actors found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {actors.map(actor => (
              <Card key={actor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    {actor.profile_image_url ? (
                      <img 
                        src={actor.profile_image_url} 
                        alt={actor.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Users className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{actor.name}</h3>
                  {actor.birth_date && (
                    <p className="text-sm text-gray-600 mb-3">
                      Born: {new Date(actor.birth_date).toLocaleDateString()}
                    </p>
                  )}
                  <Link to={`/actors/${actor.id}`}>
                    <Button size="sm" className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

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

export default Actors;

