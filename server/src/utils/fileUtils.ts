/**
 * Utility functions for file handling
 */

/**
 * Sanitizes a filename to prevent path traversal and injection attacks
 * @param filename The original filename to sanitize
 * @returns A sanitized version of the filename
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove any path components (directory traversal)
  let sanitized = filename.replace(/^.*[\\\/]/, '');
  
  // Remove special characters that could be problematic
  sanitized = sanitized.replace(/[^\w\-\.\s]/g, '_');
  
  // Limit length to prevent excessively long filenames
  if (sanitized.length > 255) {
    const extension = sanitized.includes('.') ? sanitized.substring(sanitized.lastIndexOf('.')) : '';
    sanitized = sanitized.substring(0, 255 - extension.length) + extension;
  }
  
  return sanitized;
};

/**
 * Gets the file extension from a filename
 * @param filename The filename to extract extension from
 * @returns The file extension (with dot) or empty string if no extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
};

/**
 * Validates if a file type is allowed
 * @param mimeType The MIME type of the file
 * @param allowedTypes Array of allowed MIME types
 * @returns Boolean indicating if the file type is allowed
 */
export const isAllowedFileType = (mimeType: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimeType);
};

/**
 * Converts file size in bytes to human-readable format
 * @param bytes File size in bytes
 * @returns Human-readable file size (e.g., "5.2 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}; 