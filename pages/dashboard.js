import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useRouter } from "next/router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { fetchNews } from "../services/newsAPI";
import { exportToPDF, exportToCSV } from "../utils/exportUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const SHEET_ID = "1Y1XSov99wQg-hyuB17-I77N256LERmPuibvJM1V8ifE";
const adminEmails = ["admin@example.com"];
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F", "#FFBB28", "#a29bfe", "#fd79a8", "#fab1a0", "#55efc4"];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [payoutRate, setPayoutRate] = useState(0);
  const [payoutTable, setPayoutTable] = useState([]);
  const [typeStats, setTypeStats] = useState([]);
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && router.pathname === "/login") {
        router.replace("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const news = await fetchNews();
        const enhancedNews = news.map((n) => {
          const authors = Array.isArray(n.author)
            ? n.author
            : typeof n.author === "string"
            ? n.author.split(",")
            : [];

          const trimmedAuthor =
            authors.slice(0, 2).map((a) => a.trim()).join(", ") +
            (authors.length > 2 ? ", ..." : "");

          return {
            ...n,
            type: Math.random() < 0.5 ? "news" : "blog",
            author: trimmedAuthor || "Unknown Author"
          };
        });

        setArticles(enhancedNews);
        setFilteredArticles(enhancedNews);

        const storedRate = localStorage.getItem("payoutRate");
        if (storedRate) setPayoutRate(parseFloat(storedRate));
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = articles;

    if (selectedAuthor) {
      filtered = filtered.filter((a) => a.author === selectedAuthor);
    }

    if (selectedType) {
      filtered = filtered.filter((a) => a.type === selectedType);
    }

    if (startDate) {
      filtered = filtered.filter(
        (a) => new Date(a.publishedAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      filtered = filtered.filter(
        (a) => new Date(a.publishedAt) <= new Date(endDate)
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredArticles(filtered);

    if (user && adminEmails.includes(user.email)) {
      const authorCounts = filtered.reduce((acc, article) => {
        const author = article.author || "Unknown Author";
        acc[author] = (acc[author] || 0) + 1;
        return acc;
      }, {});

      const payoutList = Object.entries(authorCounts).map(
        ([author, count]) => ({
          author,
          count,
          total: count * payoutRate
        })
      );

      setPayoutTable(payoutList);

      const typeCounts = filtered.reduce((acc, article) => {
        const type = article.type || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const typeStatsData = Object.entries(typeCounts).map(
        ([type, count]) => ({ type, count })
      );

      setTypeStats(typeStatsData);
    }
  }, [
    articles,
    selectedAuthor,
    selectedType,
    startDate,
    endDate,
    searchTerm,
    user,
    payoutRate
  ]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const exportToGoogleSheets = async () => {
    const res = await fetch("/api/export-to-sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: payoutTable, sheetId: SHEET_ID })
    });

    const result = await res.json();
    alert(result.message || "Export failed");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Welcome, {user.email}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 shadow"
        >
          Logout
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Search by title..."
          className="p-2 border rounded w-full md:w-1/4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="p-2 border rounded w-full md:w-1/4"
          value={selectedAuthor}
          onChange={(e) => setSelectedAuthor(e.target.value)}
        >
          <option value="">All Authors</option>
          {[...new Set(articles.map((a) => a.author).filter(Boolean))].map(
            (author, i) => (
              <option key={i} value={author}>
                {author}
              </option>
            )
          )}
        </select>

        <select
          className="p-2 border rounded w-full md:w-1/4"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="news">News</option>
          <option value="blog">Blog</option>
        </select>

        <input
          type="date"
          className="p-2 border rounded w-full md:w-1/4"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="p-2 border rounded w-full md:w-1/4"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Charts and Payout */}
      {user && adminEmails.includes(user.email) && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">💰 Payout Calculator</h3>

          <label className="block mb-2">
            Payout per article:
            <input
              type="number"
              className="border p-2 rounded ml-2 w-24"
              value={payoutRate}
              onChange={(e) => {
                const newRate = parseFloat(e.target.value) || 0;
                setPayoutRate(newRate);
                localStorage.setItem("payoutRate", newRate);
              }}
            />
          </label>

          <table className="mt-4 w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Author</th>
                <th className="py-2">Articles</th>
                <th className="py-2">Total Payout ($)</th>
              </tr>
            </thead>
            <tbody>
              {payoutTable.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{entry.author}</td>
                  <td className="py-2">{entry.count}</td>
                  <td className="py-2">{entry.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => exportToCSV(payoutTable)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export as CSV
            </button>

            <button
              onClick={() => exportToPDF(payoutTable)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export as PDF
            </button>

            <button
              onClick={exportToGoogleSheets}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Export to Google Sheets
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">📊 Payout Bar Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={payoutTable}>
                <XAxis dataKey="author" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total">
                  {payoutTable.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">🥧 Articles by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeStats}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {typeStats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-blue-800 mb-4">📰 Latest News</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredArticles.length === 0 ? (
          <p className="text-gray-500">No articles found.</p>
        ) : (
          filteredArticles.map((article, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded shadow border-l-4 border-blue-500 hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-blue-800">{article.title}</h3>
              <p className="text-sm text-gray-600">
                {article.author || "Unknown Author"} |{" "}
                {new Date(article.publishedAt).toLocaleDateString()} |{" "}
                {article.type}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline text-sm mt-2 inline-block"
              >
                Read full article
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
