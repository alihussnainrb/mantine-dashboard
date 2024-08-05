'use client';

import { Surface } from '@/components';
import useSupabase from '@/core/hooks/use-supabase';
import { PATH_AUTH, PATH_DASHBOARD } from '@/routes';
import {
  Button,
  Center,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  TextProps,
  Title,
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
  email: z.string().min(1, "Email cannot be empty").email({ message: "Invalid email" }),
  password: z.string().min(1, "Password must include at least 6 characters")
})

type FormValues = z.infer<typeof schema>

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
        const { data: response, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
          phone: ''
        })
        console.log(response)
        console.log(error)
        if (error) throw error;
        if (!response.user) throw new Error("Response null");
        router.push(PATH_DASHBOARD.default)
      } catch (error) {
        showNotification({
          color: "red",
          message: "Failed to signin, Please make sure credentials are correct.",
        })
      }
    })
  }

  return (
    <>
      <>
        <title>Sign in | DesignSparx</title>
        <meta
          name="description"
          content="Explore our versatile dashboard website template featuring a stunning array of themes and meticulously crafted components. Elevate your web project with seamless integration, customizable themes, and a rich variety of components for a dynamic user experience. Effortlessly bring your data to life with our intuitive dashboard template, designed to streamline development and captivate users. Discover endless possibilities in design and functionality today!"
        />
      </>
      <Title ta="center">Welcome back!</Title>
      <Text ta="center">Sign in to your account to continue</Text>

      <Surface component={Paper} className={classes.card}>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
        >
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
            required
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
          <Group justify="space-between" mt="lg">
            <Checkbox
              label="Remember me"
              classNames={{ label: classes.label }}
            />
            <Text
              component={Link}
              href={PATH_AUTH.passwordReset}
              size="sm"
              {...LINK_PROPS}
            >
              Forgot password?
            </Text>
          </Group>
          <Button
            fullWidth
            mt="xl"
            type="submit"
            loading={pending}
            disabled={pending}
          >
            Sign in
          </Button>
        </form>
        <Center mt="md">
          <Text
            fz="sm"
            ta="center"
            component={Link}
            href={PATH_AUTH.signup}
            {...LINK_PROPS}
          >
            Do not have an account yet? Create account
          </Text>
        </Center>
      </Surface>
    </>
  );
}

export default Page;
