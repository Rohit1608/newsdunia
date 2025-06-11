// services/newsAPI.js
export async function fetchNews() {
  try {
    const res = await fetch('/api/news');
    const data = await res.json();
    return data.articles || [];
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
}
  