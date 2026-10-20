/*
# Remove the default public EXECUTE grant from the audit trigger helper

## Security change
PostgreSQL grants EXECUTE on newly created functions to `PUBLIC` by default.
Revoke that default grant as well as the role-specific grants so
`public.log_change()` cannot be called through the Data API. Existing database
triggers continue to invoke it as the function owner.

## Data safety
No scoreboard data is modified or removed.
*/

REVOKE EXECUTE ON FUNCTION public.log_change() FROM PUBLIC, anon, authenticated;
