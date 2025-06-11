// services/newsAPI.js
export async function fetchNews() {
    const apiKey ="e343a56a02b44d53b4fe51e236ea20b2";
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
  