begin;

-- The public Ximo website is backed by the older control-plane schema in
-- `ximoheadquaters` (project `ubuccjihvxhphxpoymjj`). It is deliberately
-- separate from the POS operational project. This migration records genuine
-- public website registrations as client prospects, including accounts that
-- have not verified their email or chosen a subscription yet.
--
-- Do not run this migration against the POS operational project: its client
-- schema is newer and has its own 0041_registered_website_clients.sql.

create table if not exists public.client_auth_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  client_id uuid not null unique references public.clients(id) on delete cascade,
  email text not null,
  email_confirmed_at timestamptz,
  source text not null default 'website_signup'
    check (source in ('website_signup', 'linked_existing_client')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_auth_accounts_client_idx
  on public.client_auth_accounts(client_id);
create index if not exists client_auth_accounts_unverified_idx
  on public.client_auth_accounts(email_confirmed_at)
  where email_confirmed_at is null;

drop trigger if exists client_auth_accounts_updated_at on public.client_auth_accounts;
create trigger client_auth_accounts_updated_at
before update on public.client_auth_accounts
for each row execute function public.set_updated_at();

-- Only public website signups carry this marker. The secondary display-name
-- condition below is used solely to backfill existing public registrations.
-- Accounts with a platform role and PayMongo technical test accounts are
-- intentionally excluded from both paths.
create or replace function public.sync_website_signup_client()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  linked_client_id uuid;
  account_name text;
begin
  select mapping.client_id
    into linked_client_id
    from public.client_auth_accounts mapping
   where mapping.user_id = new.id;

  if linked_client_id is null
     and coalesce(new.raw_user_meta_data ->> 'ximo_account_type', '') <> 'website_client' then
    return new;
  end if;

  if linked_client_id is null
     and (
       new.email is null
       or btrim(new.email) = ''
       or lower(new.email) like 'paymongo_test_%@example.com'
       or lower(new.email) like 'paymongo_real_%@example.com'
       or exists (
         select 1
           from public.user_roles user_role
          where user_role.user_id = new.id
       )
     ) then
    return new;
  end if;

  if linked_client_id is null then
    select client.id
      into linked_client_id
      from public.clients client
     where lower(client.primary_email::text) = lower(new.email)
     order by client.created_at asc
     limit 1
     for update;

    if linked_client_id is null then
      account_name := nullif(btrim(new.raw_user_meta_data ->> 'display_name'), '');
      if char_length(coalesce(account_name, '')) < 2 then
        account_name := nullif(btrim(split_part(new.email, '@', 1)), '');
      end if;
      if char_length(coalesce(account_name, '')) < 2 then
        account_name := 'Ximo client';
      end if;

      insert into public.clients (
        kind,
        status,
        legal_name,
        display_name,
        primary_email,
        source,
        owner_user_id,
        metadata,
        created_by,
        updated_by
      )
      values (
        'individual',
        'prospect',
        left(account_name, 200),
        left(account_name, 200),
        lower(new.email),
        'website_signup',
        new.id,
        jsonb_build_object(
          'source', 'website_signup',
          'subscription_state', 'not_subscribed'
        ),
        new.id,
        new.id
      )
      returning id into linked_client_id;
    end if;
  end if;

  insert into public.client_members (
    client_id,
    user_id,
    relationship,
    is_primary,
    created_by
  )
  values (linked_client_id, new.id, 'owner', true, new.id)
  on conflict (client_id, user_id) do update
    set is_primary = excluded.is_primary;

  insert into public.client_auth_accounts (
    user_id,
    client_id,
    email,
    email_confirmed_at,
    source
  )
  values (
    new.id,
    linked_client_id,
    lower(new.email),
    new.email_confirmed_at,
    'website_signup'
  )
  on conflict (user_id) do update
    set client_id = excluded.client_id,
        email = excluded.email,
        email_confirmed_at = excluded.email_confirmed_at,
        source = excluded.source,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_website_signup_client_on_auth_user on auth.users;
create trigger sync_website_signup_client_on_auth_user
after insert or update of email, email_confirmed_at, raw_user_meta_data on auth.users
for each row execute function public.sync_website_signup_client();

-- Backfill only real pre-marker public registrations. The display name came
-- from the public signup form; platform staff always have a user role.
insert into public.clients (
  kind,
  status,
  legal_name,
  display_name,
  primary_email,
  source,
  owner_user_id,
  metadata,
  created_by,
  updated_by
)
select
  'individual',
  'prospect',
  left(btrim(account.raw_user_meta_data ->> 'display_name'), 200),
  left(btrim(account.raw_user_meta_data ->> 'display_name'), 200),
  lower(account.email),
  'website_signup',
  account.id,
  jsonb_build_object(
    'source', 'website_signup_backfill',
    'subscription_state', 'not_subscribed'
  ),
  account.id,
  account.id
from auth.users account
where account.email is not null
  and btrim(account.email) <> ''
  and lower(account.email) not like 'paymongo_test_%@example.com'
  and lower(account.email) not like 'paymongo_real_%@example.com'
  and char_length(btrim(coalesce(account.raw_user_meta_data ->> 'display_name', ''))) >= 2
  and not exists (
    select 1 from public.user_roles user_role where user_role.user_id = account.id
  )
  and not exists (
    select 1
      from public.clients client
     where lower(client.primary_email::text) = lower(account.email)
  );

-- Link both new backfilled prospects and any pre-existing client whose email
-- already matches a genuine public website account. One client record maps to
-- one website owner, matching the table's unique client_id design.
with eligible_accounts as (
  select account.id, account.email, account.email_confirmed_at, account.raw_user_meta_data
    from auth.users account
   where account.email is not null
     and btrim(account.email) <> ''
     and lower(account.email) not like 'paymongo_test_%@example.com'
     and lower(account.email) not like 'paymongo_real_%@example.com'
     and (
       coalesce(account.raw_user_meta_data ->> 'ximo_account_type', '') = 'website_client'
       or char_length(btrim(coalesce(account.raw_user_meta_data ->> 'display_name', ''))) >= 2
     )
     and not exists (
       select 1 from public.user_roles user_role where user_role.user_id = account.id
     )
), matching_clients as (
  select distinct on (account.id)
    account.id as user_id,
    account.email,
    account.email_confirmed_at,
    account.raw_user_meta_data,
    client.id as client_id
  from eligible_accounts account
  join public.clients client
    on lower(client.primary_email::text) = lower(account.email)
  left join public.client_auth_accounts existing_client_mapping
    on existing_client_mapping.client_id = client.id
   and existing_client_mapping.user_id <> account.id
  where existing_client_mapping.client_id is null
  order by account.id, client.created_at asc
)
insert into public.client_members (
  client_id,
  user_id,
  relationship,
  is_primary,
  created_by
)
select client_id, user_id, 'owner', true, user_id
from matching_clients
on conflict (client_id, user_id) do update
  set is_primary = excluded.is_primary;

with eligible_accounts as (
  select account.id, account.email, account.email_confirmed_at, account.raw_user_meta_data
    from auth.users account
   where account.email is not null
     and btrim(account.email) <> ''
     and lower(account.email) not like 'paymongo_test_%@example.com'
     and lower(account.email) not like 'paymongo_real_%@example.com'
     and (
       coalesce(account.raw_user_meta_data ->> 'ximo_account_type', '') = 'website_client'
       or char_length(btrim(coalesce(account.raw_user_meta_data ->> 'display_name', ''))) >= 2
     )
     and not exists (
       select 1 from public.user_roles user_role where user_role.user_id = account.id
     )
), matching_clients as (
  select distinct on (account.id)
    account.id as user_id,
    account.email,
    account.email_confirmed_at,
    account.raw_user_meta_data,
    client.id as client_id
  from eligible_accounts account
  join public.clients client
    on lower(client.primary_email::text) = lower(account.email)
  left join public.client_auth_accounts existing_client_mapping
    on existing_client_mapping.client_id = client.id
   and existing_client_mapping.user_id <> account.id
  where existing_client_mapping.client_id is null
  order by account.id, client.created_at asc
)
insert into public.client_auth_accounts (
  user_id,
  client_id,
  email,
  email_confirmed_at,
  source
)
select
  user_id,
  client_id,
  lower(email),
  email_confirmed_at,
  case
    when coalesce(raw_user_meta_data ->> 'ximo_account_type', '') = 'website_client'
      then 'website_signup'
    else 'linked_existing_client'
  end
from matching_clients
on conflict (user_id) do update
  set client_id = excluded.client_id,
      email = excluded.email,
      email_confirmed_at = excluded.email_confirmed_at,
      source = excluded.source,
      updated_at = now();

alter table public.client_auth_accounts enable row level security;

drop policy if exists client_auth_accounts_read on public.client_auth_accounts;
create policy client_auth_accounts_read
  on public.client_auth_accounts
  for select
  to authenticated
  using (public.has_permission('clients.read'));

revoke all on table public.client_auth_accounts from anon;
revoke all on table public.client_auth_accounts from authenticated;
grant select on table public.client_auth_accounts to authenticated;

comment on table public.client_auth_accounts is
  'Links genuine public Ximo website accounts to client records so admins can see unverified and unsubscribed registrations without exposing auth.users.';

notify pgrst, 'reload schema';

commit;
