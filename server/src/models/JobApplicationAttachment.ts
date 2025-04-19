import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// These are all the attributes in the JobApplicationAttachment model
interface JobApplicationAttachmentAttributes {
  id: string;
  jobApplicationId: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  description: string | null;
  attachmentType: 'resume' | 'cover_letter' | 'email' | 'offer_letter' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

// Some attributes are optional in `JobApplicationAttachment.build` and `JobApplicationAttachment.create` calls
interface JobApplicationAttachmentCreationAttributes extends Optional<JobApplicationAttachmentAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

class JobApplicationAttachment extends Model<JobApplicationAttachmentAttributes, JobApplicationAttachmentCreationAttributes> implements JobApplicationAttachmentAttributes {
  public id!: string;
  public jobApplicationId!: string;
  public userId!: string;
  public fileName!: string;
  public fileType!: string;
  public fileSize!: number;
  public fileUrl!: string;
  public description!: string | null;
  public attachmentType!: 'resume' | 'cover_letter' | 'email' | 'offer_letter' | 'other';

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

JobApplicationAttachment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    jobApplicationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'job_applications',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachmentType: {
      type: DataTypes.ENUM('resume', 'cover_letter', 'email', 'offer_letter', 'other'),
      allowNull: false,
      defaultValue: 'other',
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
    modelName: 'JobApplicationAttachment',
    tableName: 'job_application_attachments',
    indexes: [
      {
        name: 'job_application_attachments_application_id_idx',
        fields: ['jobApplicationId'],
      },
      {
        name: 'job_application_attachments_user_id_idx',
        fields: ['userId'],
      },
    ],
  }
);

export default JobApplicationAttachment; 