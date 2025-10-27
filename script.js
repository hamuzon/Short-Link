document.addEventListener("DOMContentLoaded", () => {
  const baseYear = 2025;
  const currentYear = new Date().getFullYear();
  const hostname = window.location.hostname;
  const footer = document.getElementById("copyright");

  // フッター表示
  footer.innerHTML = hostname === "hamuzon.github.io"
    ? `&copy; ${baseYear}${currentYear > baseYear ? "–" + currentYear : ""} <a class="link" href="https://hamuzon.github.io" target="_blank" rel="noopener noreferrer">@hamuzon</a>`
    : `&copy; ${baseYear}${currentYear > baseYear ? "–" + currentYear : ""} Short Link`;

  // DOM要素取得
  const form = document.getElementById("shortenForm");
  const errorMessage = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");
  const shortUrlDisplay = document.getElementById("shortUrlDisplay");
  const shortUrlLink = document.getElementById("shortUrlLink");
  const copyBtn = document.getElementById("copyButton");
  const copyMsg = document.getElementById("copyMessage");
  const resetBtn = document.getElementById("resetButton");

  const API_ENDPOINT = "https://link.hamusata.f5.si/api/shorten";

  // フォーム送信
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 表示リセット
    errorMessage.style.display = "none";
    shortUrlDisplay.style.display = "none";
    resetBtn.style.display = "none";
    copyMsg.textContent = "";

    const url = form.url.value.trim();

    if (!url) {
      errorText.textContent = "URLを入力してください / Please enter a URL";
      errorMessage.style.display = "";
      return;
    }

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        errorText.textContent = data.error || "エラーが発生しました / An error occurred";
        errorMessage.style.display = "";
        return;
      }

      if (data.shortCode) {
        // 現在のサブパス・ファイル名取得
        const path = window.location.pathname.split("/").slice(0, -1).join("/") + "/";
        const shortUrl = `${window.location.origin}${path}?url=${data.shortCode}`;

        shortUrlLink.href = shortUrl;
        shortUrlLink.textContent = shortUrl;
        shortUrlDisplay.style.display = "";
        resetBtn.style.display = "";
      } else {
        errorText.textContent = "不明なレスポンスです / Unknown response";
        errorMessage.style.display = "";
      }

    } catch (err) {
      errorText.textContent = "通信エラーが発生しました / Network error occurred";
      errorMessage.style.display = "";
      console.error(err);
    }
  });

  // Copyボタン
  copyBtn.addEventListener("click", () => {
    if (shortUrlLink.href) {
      navigator.clipboard.writeText(shortUrlLink.href)
        .then(() => {
          copyMsg.textContent = `✅ コピーしました！ / Copied: ${shortUrlLink.href}`;
          setTimeout(() => (copyMsg.textContent = ""), 3000);
        })
        .catch(() => {
          copyMsg.textContent = "❌ コピーに失敗しました / Copy failed";
        });
    }
  });

  // リセットボタン
  resetBtn.addEventListener("click", () => {
    form.reset();
    shortUrlDisplay.style.display = "none";
    resetBtn.style.display = "none";
    errorMessage.style.display = "none";
    copyMsg.textContent = "";
  });

  // 履歴書き換え（リロード時に ?url= が残らない）
  if (window.history.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});