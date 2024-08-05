create table public.users (
    id uuid not null,
    created_at timestamp without time zone not null default now(),
    updated_at timestamp without time zone null,
    photo_url text not null,
    name text not null,
    constraint users_pkey primary key (id),
    constraint users_id_fkey foreign key (id) references auth.users (id) on update cascade on delete cascade
) tablespace pg_default;