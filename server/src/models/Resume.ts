import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// These are all the attributes in the Resume model
interface ResumeAttributes {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  isActive: boolean;
  parsedData: any; // Stores the parsed resume data as JSON
  createdAt: Date;
  updatedAt: Date;
}

// Some attributes are optional in `Resume.build` and `Resume.create` calls
interface ResumeCreationAttributes extends Optional<ResumeAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class Resume extends Model<ResumeAttributes, ResumeCreationAttributes> implements ResumeAttributes {
  public id!: string;
  public userId!: string;
  public filename!: string;
  public originalFilename!: string;
  public fileUrl!: string;
  public fileType!: string;
  public fileSize!: number;
  public isActive!: boolean;
  public parsedData!: any;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resume.init(
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
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalFilename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileUrl: {
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
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    parsedData: {
      type: DataTypes.JSONB,
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
    modelName: 'Resume',
    tableName: 'resumes',
    indexes: [
      {
        name: 'resumes_user_id_idx',
        fields: ['userId'],
      },
    ],
  }
);

export default Resume; 