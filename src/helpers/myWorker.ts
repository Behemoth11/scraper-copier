self.addEventListener("install", () => {
  console.log(
    "I am the service worker, just here to say that I have been successfully installed"
  );
});

const NO_PROXY_PATHS = [
  "/__domain__of__interest",
  "/helpers/main.js",
  "/__my_worker__.js",
  "/update-domain"
]

self.addEventListener("fetch", function (event: any) {

  const requestPath = new URL(event.request.url).pathname;
  if (NO_PROXY_PATHS.includes(requestPath)) return;

  const handler = async () => {
    const request = event.request;

    const requestData = {
      url: request.url,
      catch: request.cache,
      method: request.method,
      headers: request.headers,
      credentials: request.credentials,
      referrerPolicy: request.referrerPolicy
    }

    // we redirect the request with all its parameters to be handle by the proxy server,
    // This part a bit confusing. The pages lives on some port starting with localhost with
    // url of the form localhost:$port_number. Because of that, browser parsers will parse
    // relative paths to localhost:$port_number. Be we will proxy all urls and let the routing
    // to the discretion of proxy serve which has more Resources and is already processes more
    // more resources thus allowing it to take better routing decisions.

    const proxyURL  = `/proxy?request=${btoa(JSON.stringify(requestData))}`;

    const response = await fetch(proxyURL);
    
    return response;
  };

  event.respondWith(handler());
});
