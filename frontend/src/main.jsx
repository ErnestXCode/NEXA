import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import api from "./api/axios.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      keepPreviousData: true,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister,
});

// Register service worker and request push subscription
if ("serviceWorker" in navigator && "PushManager" in window) {
  console.log(1)
  window.addEventListener("load", async () => {
    try {
      let registration;
      try {
        registration = await navigator.serviceWorker.register("/custom-sw.js");
        console.log("Service Worker registered", registration);
      } catch (swError) {
        console.error("Service Worker registration failed:", swError);
        return; // stop further execution if SW fails
      }
      console.log(2)

      let permission;
      try {
        permission = await Notification.requestPermission();
        console.log("Notification permission status:", permission);
      } catch (permError) {
        console.error("Notification permission request failed:", permError);
        return;
      }

      if (permission !== "granted") {
        console.warn(
          "Notification permission not granted. Skipping push subscription."
        );
        return;
      }
console.log(3)
      let subscription;
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
        });
        console.log("Push subscription created:", subscription);
      } catch (subError) {
        console.error("Push subscription failed:", subError);
        return;
      }
      console.log(4)

      try {
        const res = await api.post("/push/subscribe", subscription);
        console.log("Push subscription saved on server:", res);
      } catch (apiError) {
        console.error("Failed to send subscription to backend:", apiError);
      }
      console.log(5)

    } catch (outerError) {
      console.error("Unexpected error in SW/push registration:", outerError);
    }
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: Infinity,
//       cacheTime: Infinity,
//       refetchOnWindowFocus: false,
//       refetchOnMount: false,
//       refetchOnReconnect: false,
//     },
//   },
// });

// const persister = createSyncStoragePersister({
//   storage: window.localStorage,
// });

// persistQueryClient({
//   queryClient,
//   persister,
// });

// // Register service worker and request push subscription
// if ("serviceWorker" in navigator && "PushManager" in window) {
//   window.addEventListener("load", async () => {
//     try {
//       const registration = await navigator.serviceWorker.register(
//         "/custom-sw.js"
//       );
//       console.log("Service Worker registered", registration);

//       // Request notification permission
//       const permission = await Notification.requestPermission();
//       if (permission === "granted") {
//         console.log("Notification permission granted.");

//         // Subscribe user to push
//         const subscription = await registration.pushManager.subscribe({
//           userVisibleOnly: true,
//           applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY, // must be base64
//         });

//         // Send subscription to backend
//         const res = await api.post("/push/subscribe", subscription);

//         console.log('res', res);

//         console.log("Push subscription saved on server");
//       }
//     } catch (err) {
//       console.error("SW or Push registration failed:", err);
//     }
//   });
// }

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <Provider store={store}>
//       <QueryClientProvider client={queryClient}>
//         <App />
//         <ReactQueryDevtools initialIsOpen={false} />
//       </QueryClientProvider>
//     </Provider>
//   </StrictMode>
// );
