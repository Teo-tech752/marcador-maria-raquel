/*
# Lock the audit trigger function

## Purpose
`log_change()` is an internal SECURITY DEFINER trigger helper. It must run
when the database records a change, but it must never be callable as a public
RPC endpoint by anonymous or signed-in clients.

## Security change
- Revoke EXECUTE on `public.log_change()` from `anon` and `authenticated`.
- The trigger mechanism continues to invoke the function as its owner, so the
  audit history remains automatic without exposing a privileged RPC.

## Data safety
No tables, rows, columns, or existing audit entries are deleted or changed.
*/

REVOKE EXECUTE ON FUNCTION public.log_change() FROM anon, authenticated;
