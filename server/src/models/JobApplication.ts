import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// These are all the attributes in the JobApplication model
interface JobApplicationAttributes {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  location: string | null;
  jobDescription: string | null;
  applicationUrl: string | null;
  applicationDate: Date;
  status: 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'ghosted';
  source: string | null;
  notes: string | null;
  salary: number | null;
  feedback: string | null;
  matchScore: number | null; // Score calculated by AI for match with user's preferences/resume
  followUpDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Some attributes are optional in `JobApplication.build` and `JobApplication.create` calls
interface JobApplicationCreationAttributes extends Optional<JobApplicationAttributes, 'id' | 'location' | 'jobDescription' | 'applicationUrl' | 'source' | 'notes' | 'salary' | 'feedback' | 'matchScore' | 'followUpDate' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class JobApplication extends Model<JobApplicationAttributes, JobApplicationCreationAttributes> implements JobApplicationAttributes {
  public id!: string;
  public userId!: string;
  public jobTitle!: string;
  public company!: string;
  public location!: string | null;
  public jobDescription!: string | null;
  public applicationUrl!: string | null;
  public applicationDate!: Date;
  public status!: 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn' | 'ghosted';
  public source!: string | null;
  public notes!: string | null;
  public salary!: number | null;
  public feedback!: string | null;
  public matchScore!: number | null;
  public followUpDate!: Date | null;
  public isActive!: boolean;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

JobApplication.init(
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
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    applicationUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    applicationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('applied', 'interview', 'offer', 'rejected', 'withdrawn', 'ghosted'),
      allowNull: false,
      defaultValue: 'applied',
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    salary: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    matchScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    followUpDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'JobApplication',
    tableName: 'job_applications',
    indexes: [
      {
        name: 'job_applications_user_id_idx',
        fields: ['userId'],
      },
      {
        name: 'job_applications_status_idx',
        fields: ['status'],
      },
      {
        name: 'job_applications_application_date_idx',
        fields: ['applicationDate'],
      },
    ],
  }
);

export default JobApplication; 