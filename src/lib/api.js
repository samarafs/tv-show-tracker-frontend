/**
 * API service for TV Show Tracker
 */

const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // TV Shows endpoints
  async getTVShows(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tvshows${queryString ? `?${queryString}` : ''}`);
  }

  async getTVShow(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tvshows/${id}${queryString ? `?${queryString}` : ''}`);
  }

  async getTVShowEpisodes(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tvshows/${id}/episodes${queryString ? `?${queryString}` : ''}`);
  }

  async getTVShowActors(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tvshows/${id}/actors${queryString ? `?${queryString}` : ''}`);
  }

  async getGenres() {
    return this.request('/tvshows/genres');
  }

  async getTypes() {
    return this.request('/tvshows/types');
  }

  // Actors endpoints
  async getActors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/actors${queryString ? `?${queryString}` : ''}`);
  }

  async getActor(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/actors/${id}${queryString ? `?${queryString}` : ''}`);
  }

  async getActorTVShows(id, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/actors/${id}/tvshows${queryString ? `?${queryString}` : ''}`);
  }

  async searchActors(query, params = {}) {
    const searchParams = { q: query, ...params };
    const queryString = new URLSearchParams(searchParams).toString();
    return this.request(`/actors/search?${queryString}`);
  }

  // Favorites endpoints
  async getFavorites(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tvshows/favorites${queryString ? `?${queryString}` : ''}`);
  }

  async addFavorite(tvShowId) {
    return this.request(`/tvshows/favorites/${tvShowId}`, {
      method: 'POST',
    });
  }

  async removeFavorite(tvShowId) {
    return this.request(`/tvshows/favorites/${tvShowId}`, {
      method: 'DELETE',
    });
  }

  // Recommendations
  async getRecommendations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tvshows/recommendations${queryString ? `?${queryString}` : ''}`);
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(userData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  async exportUserData() {
    return this.request('/users/gdpr/data');
  }

  async exportUserDataCSV() {
    const response = await fetch(`${API_BASE_URL}/users/gdpr/data/csv`, {
      headers: this.getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }
    
    return response.blob();
  }

  async deleteAccount(password) {
    return this.request('/users/gdpr/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;

