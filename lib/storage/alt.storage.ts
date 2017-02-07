import {Location} from './location';

/**
 * Storage base class.
 */
export class AltStorage {
  /**
   * Get a list of locations from the storage
   * @returns Promise<Location[]>
   */
  getHosts(): Promise<Location[]> { return null; }

  /**
   * Update a location to the storage. Promise returns true if successful.
   * @returns Promise<boolean>
   */
  updateHost(location: Location): Promise<boolean> { return null; }

  /**
   * Remove a location to the storage. Promsie returns true if successful.
   * returns Promise<boolean>
   */
  removeHost(location: Location): Promise<boolean> { return null; }
}
