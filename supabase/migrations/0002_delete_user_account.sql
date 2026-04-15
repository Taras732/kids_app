-- RPC: delete_user_account
-- Дозволяє автентифікованому користувачу безповоротно видалити власний акаунт.
-- Необхідно для відповідності Apple App Store Guideline 5.1.1(v).
-- Каскадне видалення пов'язаних даних відбувається через FK ON DELETE CASCADE
-- у таблицях, що посилаються на auth.users(id).

create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_user_account() from public, anon;
grant execute on function public.delete_user_account() to authenticated;
