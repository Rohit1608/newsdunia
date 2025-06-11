// services/newsAPI.js
export async function fetchNews() {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${apiKey}`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.articles || [];
    } catch (err) {
      console.error("Error fetching news:", err);
      return [];
    }
  }
  