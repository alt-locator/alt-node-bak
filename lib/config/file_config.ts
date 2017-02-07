/**
 * The file storage configuration.
 */
export interface FileConfig {
  /**
   * The file name to store data. This value can be overriden by the environment
   * variable
   * 'ALT_FILENAME'.
   *
   * The default value is 'file.json'.
   */
  fileName?: string;
}