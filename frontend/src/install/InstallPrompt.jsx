import { useEffect, useState } from "react";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Hide if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    const handler = (e) => {
      e.preventDefault(); // Prevent automatic browser prompt
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt(); // Show the browser install prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      alert("🎉 Nexa has been installed to your device!");
    } else {
      alert("❌ Installation was dismissed.");
    }

    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="fixed bottom-4 right-4 px-5 py-2 bg-gray-900 text-white rounded-full shadow-lg border border-gray-700 hover:bg-gray-800 transition-all duration-200 z-50"
    >
      📲 Install Nexa
    </button>
  );
};

export default InstallPrompt;
