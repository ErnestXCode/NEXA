import { useEffect, useState } from "react";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // If app already installed, don't show
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e) => {
      e.preventDefault(); // Prevent auto prompt
      setDeferredPrompt(e);
      setShowButton(true);
    };

    // Detect beforeinstallprompt
    window.addEventListener("beforeinstallprompt", handler);

    // Detect if installed via browser UI or button
    window.addEventListener("appinstalled", () => {
      setShowButton(false);
      setToast("🎉 Nexa has been installed!");
      setTimeout(() => setToast(null), 4000);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // Show prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setToast("🎉 Nexa has been installed to your device!");
    } else {
      setToast("❌ Installation was dismissed.");
    }

    setTimeout(() => setToast(null), 4000);

    setDeferredPrompt(null);
    setShowButton(false);
  };

  return (
    <>
      {/* Install Button */}
      {showButton && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-4 right-4 px-5 py-2 bg-gray-900 text-white rounded-full shadow-lg border border-gray-700 hover:bg-gray-800 transition-all duration-200 z-50"
        >
          📲 Install Nexa
        </button>
      )}

      {/* Feedback Toast */}
      {toast && (
        <div className="fixed bottom-20 right-4 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg border border-gray-700 animate-fade-in-out z-50">
          {toast}
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
