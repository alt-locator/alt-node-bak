/**
 * The configurations based on the location of this machine.
 */
export interface LocationConfig {
  /**
   * The location name of this machine (required). The value of the locationName
   * can be overriden
   * by the environment variable 'ALT_NAME'.
   *
   * The default value is this machine's hostname.
   */
  locationName: string;
}