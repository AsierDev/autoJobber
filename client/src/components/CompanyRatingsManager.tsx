import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getAllCompanyRatings,
  getCompanyRatingsByCompany,
  getUserCompanyRatings,
  createCompanyRating,
  updateCompanyRating,
  deleteCompanyRating,
  getTopRatedCompanies,
  CompanyRating,
  TopCompany,
} from '../services/companyRatingService';

interface CompanyRatingsManagerProps {
  userId?: string;
  jobApplicationId?: string;
  companyName?: string;
  mode?: 'view' | 'create' | 'all' | 'user' | 'company' | 'top';
}

const CompanyRatingsManager: React.FC<CompanyRatingsManagerProps> = ({
  userId,
  jobApplicationId,
  companyName: propCompanyName,
  mode: propMode
}) => {
  const { tab, companyName: urlCompanyName } = useParams<{ tab?: string; companyName?: string }>();
  const navigate = useNavigate();
  
  // Determine mode based on props, URL params, or default to 'all'
  const determineMode = (): 'view' | 'create' | 'all' | 'user' | 'company' | 'top' => {
    if (propMode) return propMode;
    
    if (propCompanyName || urlCompanyName) return 'company';
    
    if (tab) {
      switch (tab) {
        case 'user': return 'user';
        case 'top': return 'top';
        case 'all': return 'all';
        default: return 'all';
      }
    }
    
    return 'all';
  };
  
  const mode = determineMode();
  const companyName = propCompanyName || urlCompanyName;
  
  // State variables
  const [ratings, setRatings] = useState<CompanyRating[]>([]);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(mode === 'create');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const initialFormData = {
    companyName: companyName || '',
    jobTitle: '',
    overallRating: 3,
    workLifeBalanceRating: 3,
    compensationRating: 3,
    cultureRating: 3,
    careerGrowthRating: 3,
    managementRating: 3,
    review: '',
    isAnonymous: false,
    pros: '',
    cons: '',
  };
  
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchRatings();
  }, [mode, companyName, userId, tab]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      let data: CompanyRating[] = [];
      
      switch (mode) {
        case 'all':
          data = await getAllCompanyRatings();
          break;
        case 'user':
          if (userId) {
            data = await getUserCompanyRatings();
          }
          break;
        case 'company':
          if (companyName) {
            data = await getCompanyRatingsByCompany(companyName);
          }
          break;
        case 'top':
          const topCompaniesData = await getTopRatedCompanies(10);
          setTopCompanies(topCompaniesData);
          break;
        default:
          data = await getAllCompanyRatings();
      }
      
      setRatings(data);
      setError(null);
    } catch (err) {
      setError('Failed to load company ratings. Please try again.');
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number' || name.includes('Rating')) {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(mode === 'create');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const ratingData = {
        ...formData,
        jobApplicationId
      };
      
      if (editingId) {
        await updateCompanyRating(editingId, ratingData);
      } else {
        await createCompanyRating(ratingData);
      }
      
      resetForm();
      fetchRatings();
      setError(null);
    } catch (err) {
      setError('Failed to save company rating. Please try again.');
      console.error('Error saving rating:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rating: CompanyRating) => {
    setFormData({
      companyName: rating.companyName,
      jobTitle: rating.jobTitle || '',
      overallRating: rating.overallRating,
      workLifeBalanceRating: rating.workLifeBalanceRating,
      compensationRating: rating.compensationRating,
      cultureRating: rating.cultureRating,
      careerGrowthRating: rating.careerGrowthRating,
      managementRating: rating.managementRating,
      review: rating.review || '',
      isAnonymous: rating.isAnonymous,
      pros: rating.pros || '',
      cons: rating.cons || '',
    });
    
    setEditingId(rating.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteCompanyRating(id);
      fetchRatings();
      setError(null);
    } catch (err) {
      setError('Failed to delete company rating. Please try again.');
      console.error('Error deleting rating:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = searchTerm
    ? ratings.filter(
        (rating) =>
          rating.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (rating.jobTitle && rating.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : ratings;

  // Rating star display component
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        ))}
      </div>
    );
  };

  if (loading && ratings.length === 0 && topCompanies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company ratings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchRatings}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      {!companyName && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <Link
              to="/company-ratings"
              className={`${
                mode === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Todas las Valoraciones
            </Link>
            <Link
              to="/company-ratings/user"
              className={`${
                mode === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Mis Valoraciones
            </Link>
            <Link
              to="/company-ratings/top"
              className={`${
                mode === 'top'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Mejores Empresas
            </Link>
          </nav>
        </div>
      )}

      {/* Top companies display (for 'top' mode) */}
      {mode === 'top' && topCompanies.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Top Rated Companies</h3>
            <p className="mt-1 text-sm text-gray-500">
              Based on overall employee ratings
            </p>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCompanies.map((company, index) => (
                <div
                  key={company.companyName}
                  className="bg-white p-4 rounded-lg shadow border-l-4"
                  style={{ borderLeftColor: `hsl(${200 - index * 20}, 70%, 50%)` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {index + 1}. {company.companyName}
                      </h4>
                      <div className="mt-1 flex items-center">
                        <RatingStars rating={company.averageRating} />
                        <span className="ml-2 text-sm text-gray-600">
                          {company.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {company.totalRatings} {company.totalRatings === 1 ? 'rating' : 'ratings'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        {['all', 'user', 'company'].includes(mode) && (
          <div className="w-full md:w-1/2">
            <label htmlFor="search" className="sr-only">
              Search companies
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-md"
                placeholder="Search companies or job titles"
              />
            </div>
          </div>
        )}
        
        {['all', 'user', 'company'].includes(mode) && (
          <div>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {showForm ? 'Hide Form' : 'Add Rating'}
            </button>
          </div>
        )}
      </div>

      {/* Rating Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingId ? 'Edit Company Rating' : 'Add New Company Rating'}
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      required
                      disabled={!!companyName}
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                    Job Title
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="jobTitle"
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Rating sliders */}
                <div className="sm:col-span-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Overall Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Overall Rating *: {formData.overallRating}
                      </label>
                      <input
                        type="range"
                        name="overallRating"
                        min="1"
                        max="5"
                        step="0.5"
                        required
                        value={formData.overallRating}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>

                    {/* Work/Life Balance Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work/Life Balance: {formData.workLifeBalanceRating}
                      </label>
                      <input
                        type="range"
                        name="workLifeBalanceRating"
                        min="1"
                        max="5"
                        step="0.5"
                        value={formData.workLifeBalanceRating}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>

                    {/* Compensation Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compensation: {formData.compensationRating}
                      </label>
                      <input
                        type="range"
                        name="compensationRating"
                        min="1"
                        max="5"
                        step="0.5"
                        value={formData.compensationRating}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>

                    {/* Culture Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Culture: {formData.cultureRating}
                      </label>
                      <input
                        type="range"
                        name="cultureRating"
                        min="1"
                        max="5"
                        step="0.5"
                        value={formData.cultureRating}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>

                    {/* Career Growth Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Career Growth: {formData.careerGrowthRating}
                      </label>
                      <input
                        type="range"
                        name="careerGrowthRating"
                        min="1"
                        max="5"
                        step="0.5"
                        value={formData.careerGrowthRating}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>

                    {/* Management Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Management: {formData.managementRating}
                      </label>
                      <input
                        type="range"
                        name="managementRating"
                        min="1"
                        max="5"
                        step="0.5"
                        value={formData.managementRating}
                        onChange={handleInputChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pros */}
                <div className="sm:col-span-3">
                  <label htmlFor="pros" className="block text-sm font-medium text-gray-700">
                    Pros
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="pros"
                      name="pros"
                      rows={3}
                      value={formData.pros}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Cons */}
                <div className="sm:col-span-3">
                  <label htmlFor="cons" className="block text-sm font-medium text-gray-700">
                    Cons
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="cons"
                      name="cons"
                      rows={3}
                      value={formData.cons}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Review */}
                <div className="sm:col-span-6">
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                    Detailed Review
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="review"
                      name="review"
                      rows={4}
                      value={formData.review}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Share your experience working at this company..."
                    />
                  </div>
                </div>

                {/* Anonymous */}
                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isAnonymous"
                        name="isAnonymous"
                        type="checkbox"
                        checked={formData.isAnonymous}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isAnonymous" className="font-medium text-gray-700">
                        Submit Anonymously
                      </label>
                      <p className="text-gray-500">
                        Your name will not be displayed with this review
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingId ? 'Update Rating' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ratings List */}
      {['all', 'user', 'company'].includes(mode) && filteredRatings.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {mode === 'user'
                ? 'Your Company Ratings'
                : mode === 'company'
                ? `Ratings for ${companyName}`
                : 'All Company Ratings'}
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredRatings.map((rating) => (
              <div key={rating.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{rating.companyName}</h4>
                    {rating.jobTitle && (
                      <p className="text-sm text-gray-500">{rating.jobTitle}</p>
                    )}
                    <div className="mt-1 flex items-center">
                      <RatingStars rating={rating.overallRating} />
                      <span className="ml-2 text-sm text-gray-700 font-medium">
                        {rating.overallRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-sm text-gray-500">
                      {format(new Date(rating.createdAt), 'MMM dd, yyyy')}
                    </span>
                    {rating.isAnonymous && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                        Anonymous
                      </span>
                    )}
                  </div>
                </div>

                {(rating.pros || rating.cons) && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rating.pros && (
                      <div className="bg-green-50 p-3 rounded-md">
                        <h5 className="text-sm font-medium text-green-800 mb-1">Pros</h5>
                        <p className="text-sm text-green-700">{rating.pros}</p>
                      </div>
                    )}
                    {rating.cons && (
                      <div className="bg-red-50 p-3 rounded-md">
                        <h5 className="text-sm font-medium text-red-800 mb-1">Cons</h5>
                        <p className="text-sm text-red-700">{rating.cons}</p>
                      </div>
                    )}
                  </div>
                )}

                {rating.review && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500 italic">{rating.review}</p>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Work/Life</div>
                    <div className="flex justify-center mt-1">
                      <RatingStars rating={rating.workLifeBalanceRating} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Compensation</div>
                    <div className="flex justify-center mt-1">
                      <RatingStars rating={rating.compensationRating} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Culture</div>
                    <div className="flex justify-center mt-1">
                      <RatingStars rating={rating.cultureRating} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Career Growth</div>
                    <div className="flex justify-center mt-1">
                      <RatingStars rating={rating.careerGrowthRating} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Management</div>
                    <div className="flex justify-center mt-1">
                      <RatingStars rating={rating.managementRating} />
                    </div>
                  </div>
                </div>

                {mode === 'user' && (
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(rating)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rating.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {['all', 'user', 'company'].includes(mode) && filteredRatings.length === 0 && !loading && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No ratings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? 'No results match your search criteria'
              : mode === 'user'
              ? 'You haven\'t rated any companies yet'
              : mode === 'company'
              ? `No ratings available for ${companyName}`
              : 'No company ratings have been submitted yet'}
          </p>
          {mode !== 'company' && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add First Rating
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyRatingsManager; 