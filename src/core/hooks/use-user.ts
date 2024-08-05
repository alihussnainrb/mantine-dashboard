import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import useSupabase from '@/core/hooks/use-supabase';


function useUser() {
  const router = useRouter();
  const client = useSupabase();
  const key = 'user';

  return useSWR([key], async () => {
    return await client.auth
      .getSession()
      .then(async (result) => {
        console.log(result)
        if (result.error) {
          return Promise.reject(result.error);
        }
        const authUser = result.data.session?.user
        if (authUser) {
          const userDataRes = await client.from("users")
            .select("*")
            .eq("id", authUser.id)
            .single()
          if (userDataRes.error || !userDataRes.data) return Promise.reject("User not found in db")
          return {
            id: authUser.id,
            name: userDataRes.data.name,
            photo_url: userDataRes.data.photo_url,
            created_at: userDataRes.data.created_at,
            updated_at: userDataRes.data.updated_at,
            email: authUser.email,
            phone: authUser.phone,
          };
        }

        return Promise.reject('Unexpected result format');
      })
      .catch((err) => {
        console.log(err)
        router.refresh();
        return Promise.reject(err);
      });
  });
}

export default useUser;
