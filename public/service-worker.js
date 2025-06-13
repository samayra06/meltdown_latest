self.addEventListener("install", () => {
  console.log("Service Worker installed.");
});

self.addEventListener("fetch", function (event) {
  // You can cache stuff here later
});
