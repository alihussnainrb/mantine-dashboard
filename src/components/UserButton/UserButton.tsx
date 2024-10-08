import useUser from '@/core/hooks/use-user';
import {
  Avatar,
  Group,
  Text,
  UnstyledButton,
  UnstyledButtonProps,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { ReactNode } from 'react';
import classes from './UserButton.module.css';

type UserProfileButtonProps = {
  image: string;
  name: string;
  email: string;
  icon?: ReactNode;
  asAction?: boolean;
} & UnstyledButtonProps;

const UserProfileButton = ({
  image,
  name,
  email,
  icon,
  asAction,
  ...others
}: UserProfileButtonProps) => {
  const { data: user } = useUser()
  return (
    <UnstyledButton className={classes.user} {...others}>
      <Group>
        <Avatar src={image} radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {user?.name || 'User Name'}
          </Text>

          <Text size="xs">{user?.email || 'user email'}</Text>
        </div>

        {icon && asAction && <IconChevronRight size="0.9rem" stroke={1.5} />}
      </Group>
    </UnstyledButton>
  );
};

export default UserProfileButton;
