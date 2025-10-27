document.addEventListener("DOMContentLoaded", () => {
  const baseYear = 2025;
  const currentYear = new Date().getFullYear();
  const hostname = window.location.hostname;
  let footerHTML = "";

  if (hostname === "hamuzon.github.io") {
    footerHTML = `&copy; ${baseYear}${currentYear > baseYear ? "–" + currentYear : ""} <a class="link" href="https://hamuzon.github.io" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
  } else {
    footerHTML = `&copy; ${baseYear}${currentYear > baseYear ? "–" + currentYear : ""} Short Link`;
  }
  document.getElementById("copyright").innerHTML = footerHTML;

  const form = document.getElementById("shortenForm");
  const errorMessage = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");
  const shortUrlDisplay = document.getElementById("shortUrlDisplay");
  const shortUrlLink = document.getElementById("shortUrlLink");
  const copyBtn = document.getElementById("copyButton");
  const copyMsg = document.getElementById("copyMessage");
  const resetBtn = document.getElementById("resetButton");

  // APIの完全URL
  const API_ENDPOINT = "https://link.hamusata.f5.si/api/shorten";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
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

      if (data.shortCode && data.shortUrl) {
        // 表示用 URL（現在のページ URL + ?url=shortCode）
        const displayUrl = `${window.location.origin}${window.location.pathname}?url=${data.shortCode}`;

        // 表示とコピーを分ける
        shortUrlLink.href = data.shortUrl;      // コピー・クリックで実際の短縮リンク
        shortUrlLink.textContent = displayUrl;  // 表示は現在のURL/?url=shortCode
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

  copyBtn.addEventListener("click", () => {
    if (shortUrlLink.href) {
      navigator.clipboard.writeText(shortUrlLink.href)
        .then(() => {
          copyMsg.textContent = "コピーしました！ / Copied!";
          setTimeout(() => (copyMsg.textContent = ""), 3000);
        })
        .catch(() => {
          copyMsg.textContent = "コピーに失敗しました / Copy failed";
        });
    }
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    shortUrlDisplay.style.display = "none";
    resetBtn.style.display = "none";
    errorMessage.style.display = "none";
    copyMsg.textContent = "";
  });

  if (window.history.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});
