# Authentication redirect configuration

Account confirmation links now target the public application's active origin and end at `/account-verified`. This page confirms the outcome and sends a customer to sign in or back to checkout.

In the Supabase project, open **Authentication → URL Configuration** and set:

- **Site URL:** the public production frontend origin, for example `https://your-ximo-website.example`.
- **Redirect URLs:** `https://your-ximo-website.example/account-verified` and `https://your-ximo-website.example/reset-password`.

Keep the confirmation email template's `{{ .ConfirmationURL }}` link intact. The frontend supplies the `redirectTo` value when the account is created. Supabase ignores redirect destinations that are not in this allow list and falls back to the Site URL, which is why a stale localhost Site URL sends customers to localhost.

For preview deployments, add an intentional preview-domain pattern only if those environments must receive real confirmation emails. Do not add a broad wildcard for unrelated domains.
