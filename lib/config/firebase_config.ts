/**
 * The firebase storage configuration.
 */
export interface FirebaseConfig {
  /**
   * The firebase host name. For example this could be:
   * 'foo-baz.firebaseio.com'. The value
   * of the firebaseHost can be overriden by environment variable
   * 'ALT_FIREBASE_HOST'.
   *
   * The default value is 'alt-github.firebaseio.com'.
   */
  firebaseHost?: string;

  /**
   * The initial path to save everything. So for example, if the path is
   * '/foobaz', the items
   * stored would be at 'foo-baz.firebase.io/foobaz'. The value of the
   * firebasePath can be
   * overriden by the environment variable 'ALT_FIREBASE_PATH'.
   *
   * The default value is '/hosts'.
   */
  firebasePath?: string;
}