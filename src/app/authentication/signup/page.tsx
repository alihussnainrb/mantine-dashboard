'use client';

import { Surface } from '@/components';
import useSupabase from '@/core/hooks/use-supabase';
import { PATH_AUTH, PATH_DASHBOARD } from '@/routes';
import {
  Button,
  Center,
  Flex,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  TextProps,
  Title
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import classes from './page.module.css';
import useTransition from '@/core/hooks/use-transition';

const LINK_PROPS: TextProps = {
  className: classes.link,
};

const schema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().min(1, "Email cannot be empty").email({ message: "Invalid email" }),
  password: z.string().min(1, "Password must include at least 6 characters"),
  confPassword: z.string().min(1, "Password must include at least 6 characters"),
}).refine((data) => data.password === data.confPassword, {
  message: "Confirm password does not match the password.",
  path: ["confPassword"],
})

type FormValues = z.infer<typeof schema>;

function Page() {
  const router = useRouter();
  const form = useForm<FormValues>({
    validate: zodResolver(schema)
  });
  const [pending, startTransition] = useTransition()
  const supabase = useSupabase()

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const { data: response, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          phone: '',
          options: {
            data: {
              name: values.name,
            }
          }
        })
        if (error) throw error;
        if (!response.session || !response.user) throw new Error("Response null");
        const createUserRes = await supabase
          .from("users")
          .insert({
            id: response.user?.id,
            name: values.name,
            photo_url: '',
          })
        if (createUserRes.error) throw new Error("Failed to create public.user")
        router.push(PATH_DASHBOARD.default)
      } catch (error) {
        showNotification({
          color: "red",
          message: "Failed to process your request. Please try again.",
        })
      }
    })
  }

  return (
    <>
      <>
        <title>Sign up</title>
        <meta
          name="description"
          content="Explore our versatile dashboard website template featuring a stunning array of themes and meticulously crafted components. Elevate your web project with seamless integration, customizable themes, and a rich variety of components for a dynamic user experience. Effortlessly bring your data to life with our intuitive dashboard template, designed to streamline development and captivate users. Discover endless possibilities in design and functionality today!"
        />
      </>
      <Title ta="center">Welcome!</Title>
      <Text ta="center">Create your account to continue</Text>

      <Surface component={Paper} className={classes.card}>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
        >
          <TextInput
            label="Name"
            placeholder="John"
            required
            classNames={{ label: classes.label }}
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
            required
            mt="md"
            classNames={{ label: classes.label }}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            classNames={{ label: classes.label }}
            {...form.getInputProps('password')}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm password"
            required
            mt="md"
            classNames={{ label: classes.label }}
            {...form.getInputProps('confPassword')}
          />
          <Button
            fullWidth
            mt="xl"
            type='submit'
            loading={pending}
            disabled={pending}
          >
            Create account
          </Button>
          <Center mt="md">
            <Text
              size="sm"
              component={Link}
              href={PATH_AUTH.signin}
              {...LINK_PROPS}
            >
              Already have an account? Sign in
            </Text>
          </Center>
        </form>
      </Surface>
    </>
  );
}

export default Page;
