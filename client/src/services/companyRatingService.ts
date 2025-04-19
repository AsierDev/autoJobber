import axios from 'axios';
import { API_URL } from '../config/constants';

// Interfaces
export interface CompanyRating {
  id: string;
  companyName: string;
  jobTitle?: string;
  overallRating: number;
  workLifeBalanceRating: number;
  compensationRating: number;
  cultureRating: number;
  careerGrowthRating: number;
  managementRating: number;
  review?: string;
  pros?: string;
  cons?: string;
  isAnonymous: boolean;
  userId: string;
  jobApplicationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopCompany {
  companyName: string;
  averageRating: number;
  totalRatings: number;
}

export interface CompanyRatingInput {
  companyName: string;
  jobTitle?: string;
  overallRating: number;
  workLifeBalanceRating: number;
  compensationRating: number;
  cultureRating: number;
  careerGrowthRating: number;
  managementRating: number;
  review?: string;
  pros?: string;
  cons?: string;
  isAnonymous: boolean;
  jobApplicationId?: string;
}

// API endpoints
const COMPANY_RATINGS_API = `${API_URL}/api/company-ratings`;

// Service functions
export const getAllCompanyRatings = async (): Promise<CompanyRating[]> => {
  try {
    const response = await axios.get(COMPANY_RATINGS_API);
    return response.data;
  } catch (error) {
    console.error('Error fetching all company ratings:', error);
    throw error;
  }
};

export const getCompanyRatingsByCompany = async (companyName: string): Promise<CompanyRating[]> => {
  try {
    const response = await axios.get(`${COMPANY_RATINGS_API}/company/${encodeURIComponent(companyName)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ratings for company ${companyName}:`, error);
    throw error;
  }
};

export const getUserCompanyRatings = async (): Promise<CompanyRating[]> => {
  try {
    const response = await axios.get(`${COMPANY_RATINGS_API}/user`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user company ratings:', error);
    throw error;
  }
};

export const getCompanyRatingById = async (id: string): Promise<CompanyRating> => {
  try {
    const response = await axios.get(`${COMPANY_RATINGS_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching company rating with id ${id}:`, error);
    throw error;
  }
};

export const getTopRatedCompanies = async (limit = 10): Promise<TopCompany[]> => {
  try {
    const response = await axios.get(`${COMPANY_RATINGS_API}/top?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated companies:', error);
    throw error;
  }
};

export const createCompanyRating = async (
  ratingData: CompanyRatingInput
): Promise<CompanyRating> => {
  try {
    const response = await axios.post(COMPANY_RATINGS_API, ratingData);
    return response.data;
  } catch (error) {
    console.error('Error creating company rating:', error);
    throw error;
  }
};

export const updateCompanyRating = async (
  id: string,
  ratingData: Partial<CompanyRatingInput>
): Promise<CompanyRating> => {
  try {
    const response = await axios.put(`${COMPANY_RATINGS_API}/${id}`, ratingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating company rating with id ${id}:`, error);
    throw error;
  }
};

export const deleteCompanyRating = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${COMPANY_RATINGS_API}/${id}`);
  } catch (error) {
    console.error(`Error deleting company rating with id ${id}:`, error);
    throw error;
  }
}; 