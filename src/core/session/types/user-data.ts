/**
 * This interface represents the user record in the Database
 * Not to be confused with {@link User} defined in Supabase Auth
 * This data is always present in {@link UserSession}
 */
interface UserData {
  id: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string | null;
  onboarded: boolean;
  lastOnboarded?: string | null;
}

export default UserData;
