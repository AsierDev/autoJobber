import React from 'react';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';

interface JobPreferenceValues {
  title: string;
  industry: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite' | '';
  minSalary: string;
  maxSalary: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | '';
  keywords: string;
}

const initialValues: JobPreferenceValues = {
  title: '',
  industry: '',
  location: '',
  workMode: '',
  minSalary: '',
  maxSalary: '',
  companySize: '',
  keywords: '',
};

const JobPreferencesSchema = Yup.object().shape({
  title: Yup.string().required('Job title is required'),
  industry: Yup.string(),
  location: Yup.string(),
  workMode: Yup.string().oneOf(['remote', 'hybrid', 'onsite', '']),
  minSalary: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable(),
  maxSalary: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .test(
      'min-max',
      'Max salary must be greater than min salary',
      function (value) {
        const { minSalary } = this.parent;
        return !minSalary || !value || Number(value) >= Number(minSalary);
      }
    ),
  companySize: Yup.string().oneOf(['startup', 'small', 'medium', 'large', 'enterprise', '']),
  keywords: Yup.string(),
});

interface JobPreferencesFormProps {
  onSubmit: (values: any) => Promise<void>;
  initialData?: any;
}

const JobPreferencesForm: React.FC<JobPreferencesFormProps> = ({ onSubmit, initialData }) => {
  const handleSubmit = async (
    values: JobPreferenceValues,
    { setSubmitting }: FormikHelpers<JobPreferenceValues>
  ) => {
    try {
      // Transform keywords from comma-separated string to array
      const formattedValues = {
        ...values,
        minSalary: values.minSalary ? Number(values.minSalary) : null,
        maxSalary: values.maxSalary ? Number(values.maxSalary) : null,
        keywords: values.keywords ? values.keywords.split(',').map(k => k.trim()) : [],
      };
      await onSubmit(formattedValues);
    } catch (error) {
      console.error('Error submitting preferences:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Job Search Preferences</h2>
      
      <Formik
        initialValues={initialData || initialValues}
        validationSchema={JobPreferencesSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <Field
                type="text"
                name="title"
                id="title"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.title && touched.title ? 'border-red-500' : ''
                }`}
                placeholder="e.g. Software Engineer, Product Manager"
              />
              <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                Industry
              </label>
              <Field
                type="text"
                name="industry"
                id="industry"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. Technology, Healthcare, Finance"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Field
                type="text"
                name="location"
                id="location"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. San Francisco, CA, USA"
              />
            </div>

            <div>
              <label htmlFor="workMode" className="block text-sm font-medium text-gray-700">
                Work Mode
              </label>
              <Field
                as="select"
                name="workMode"
                id="workMode"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select work mode</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700">
                  Minimum Salary (USD)
                </label>
                <Field
                  type="number"
                  name="minSalary"
                  id="minSalary"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. 70000"
                />
                <ErrorMessage name="minSalary" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label htmlFor="maxSalary" className="block text-sm font-medium text-gray-700">
                  Maximum Salary (USD)
                </label>
                <Field
                  type="number"
                  name="maxSalary"
                  id="maxSalary"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. 120000"
                />
                <ErrorMessage name="maxSalary" component="div" className="mt-1 text-sm text-red-600" />
              </div>
            </div>

            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                Company Size
              </label>
              <Field
                as="select"
                name="companySize"
                id="companySize"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select company size</option>
                <option value="startup">Startup (1-50 employees)</option>
                <option value="small">Small (51-200 employees)</option>
                <option value="medium">Medium (201-1000 employees)</option>
                <option value="large">Large (1001-5000 employees)</option>
                <option value="enterprise">Enterprise (5000+ employees)</option>
              </Field>
            </div>

            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                Keywords (comma separated)
              </label>
              <Field
                type="text"
                name="keywords"
                id="keywords"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g. React, TypeScript, Node.js"
              />
              <p className="mt-1 text-xs text-gray-500">
                Add keywords related to skills, technologies, or specific job requirements
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default JobPreferencesForm; 