export default function({
  beforeNuxtRender,
  $auth,
  $config: { google_client_id, login_api_url },
}) {
  if (process.server) {
    beforeNuxtRender((nuxtState) => {
      nuxtState.nuxtState.config.google_client_id = google_client_id;
    });
  }
  $auth.strategies.google.options.clientId = google_client_id;
  $auth.strategies.google.options.endpoints.userInfo = `${login_api_url}/user/local/profile`;
}
