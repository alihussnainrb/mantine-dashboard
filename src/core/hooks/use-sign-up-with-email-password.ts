import useSWRMutation from 'swr/mutation';
import useSupabase from './use-supabase';
import configuration from '~/configuration';
import { sendWelcomeEmail } from '~/lib/postmark/actions';
import useCsrfToken from './use-csrf-token';

interface Credentials {
  email: string;
  password: string;
}

/**
 * @name useSignUpWithEmailAndPassword
 */
function useSignUpWithEmailAndPassword() {
  const csrfToken = useCsrfToken();
  const client = useSupabase();
  const key = ['auth', 'sign-up-with-email-password'];

  return useSWRMutation(
    key,
    (_, { arg: credentials }: { arg: Credentials }) => {
      const emailRedirectTo = [
        window.location.origin,
        configuration.paths.authCallback,
      ].join('');

      return client.auth
        .signUp({
          ...credentials,
          options: {
            emailRedirectTo,
          },
        })
        .then(async (response) => {
          if (response.error) {
            throw response.error.message;
          }

          const user = response.data?.user;
          const identities = user?.identities ?? [];

          // if the user has no identities, it means that the email is taken
          if (identities.length === 0) {
            throw new Error('User already registered');
          }
          await sendWelcomeEmail({
            csrfToken: csrfToken,
            email: credentials.email,
            redirectTo: [window.location.origin, 'onboarding'].join('/'),
          })
          return response.data;
        });
    },
  );
}

export default useSignUpWithEmailAndPassword;
