import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// These are all the attributes in the JobPreference model
interface JobPreferenceAttributes {
  id: string;
  userId: string;
  title: string;
  industry: string | null;
  location: string | null;
  workMode: 'remote' | 'hybrid' | 'onsite' | null;
  minSalary: number | null;
  maxSalary: number | null;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null;
  isActive: boolean;
  keywords: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

// Some attributes are optional in `JobPreference.build` and `JobPreference.create` calls
interface JobPreferenceCreationAttributes extends Optional<JobPreferenceAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'industry' | 'location' | 'workMode' | 'minSalary' | 'maxSalary' | 'companySize' | 'keywords'> {}

class JobPreference extends Model<JobPreferenceAttributes, JobPreferenceCreationAttributes> implements JobPreferenceAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public industry!: string | null;
  public location!: string | null;
  public workMode!: 'remote' | 'hybrid' | 'onsite' | null;
  public minSalary!: number | null;
  public maxSalary!: number | null;
  public companySize!: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null;
  public isActive!: boolean;
  public keywords!: string[] | null;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

JobPreference.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    industry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    workMode: {
      type: DataTypes.ENUM('remote', 'hybrid', 'onsite'),
      allowNull: true,
    },
    minSalary: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maxSalary: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    companySize: {
      type: DataTypes.ENUM('startup', 'small', 'medium', 'large', 'enterprise'),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
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
    modelName: 'JobPreference',
    tableName: 'job_preferences',
    indexes: [
      {
        name: 'job_preferences_user_id_idx',
        fields: ['userId'],
      },
    ],
  }
);

export default JobPreference; 