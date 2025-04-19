import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// These are all the attributes in the CompanyRating model
interface CompanyRatingAttributes {
  id: string;
  userId: string;
  jobApplicationId: string | null;
  companyName: string;
  overallRating: number; // 1-5 stars
  interviewProcess: number | null; // 1-5 stars
  workLifeBalance: number | null; // 1-5 stars
  compensation: number | null; // 1-5 stars
  careerGrowth: number | null; // 1-5 stars
  review: string | null;
  pros: string | null;
  cons: string | null;
  anonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Some attributes are optional in `CompanyRating.build` and `CompanyRating.create` calls
interface CompanyRatingCreationAttributes extends Optional<CompanyRatingAttributes, 'id' | 'jobApplicationId' | 'interviewProcess' | 'workLifeBalance' | 'compensation' | 'careerGrowth' | 'review' | 'pros' | 'cons' | 'anonymous' | 'createdAt' | 'updatedAt'> {}

class CompanyRating extends Model<CompanyRatingAttributes, CompanyRatingCreationAttributes> implements CompanyRatingAttributes {
  public id!: string;
  public userId!: string;
  public jobApplicationId!: string | null;
  public companyName!: string;
  public overallRating!: number;
  public interviewProcess!: number | null;
  public workLifeBalance!: number | null;
  public compensation!: number | null;
  public careerGrowth!: number | null;
  public review!: string | null;
  public pros!: string | null;
  public cons!: string | null;
  public anonymous!: boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CompanyRating.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    jobApplicationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'job_applications',
        key: 'id',
      },
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    overallRating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    interviewProcess: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    workLifeBalance: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    compensation: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    careerGrowth: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pros: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cons: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'CompanyRating',
    tableName: 'company_ratings',
    indexes: [
      {
        name: 'company_ratings_company_name_idx',
        fields: ['companyName'],
      },
      {
        name: 'company_ratings_user_id_idx',
        fields: ['userId'],
      },
      {
        name: 'company_ratings_job_application_id_idx',
        fields: ['jobApplicationId'],
      },
    ],
  }
);

export default CompanyRating; 