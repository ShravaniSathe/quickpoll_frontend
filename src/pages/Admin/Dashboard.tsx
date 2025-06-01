import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api";
import Cookies from "js-cookie";
import io from "socket.io-client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";


ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

ChartJS.register(ArcElement, Tooltip, Legend);

const socket = io(import.meta.env.VITE_API_LINK);

export default function AdminDashboard() {
  const [polls, setPolls] = useState<any[]>([]);
  const [liveResults, setLiveResults] = useState<Record<string, any>>({});
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"dashboard" | "active" | "ended">("dashboard");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get("/api/admin/polls");
        setPolls(res.data);
        res.data.forEach((poll: any) => {
          socket.emit("joinPollRoom", poll._id);
        });
      } catch (err) {
        console.error("Failed to fetch polls", err);
      }
    };

    fetchPolls();

    socket.on("pollResultsUpdate", (data) => {
      setLiveResults((prev) => ({
        ...prev,
        [data._id]: data,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newCountdowns: Record<string, string> = {};

      polls.forEach((poll) => {
        const expiresAt = new Date(poll.expiresAt).getTime();
        const distance = expiresAt - now;

        if (distance > 0) {
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          newCountdowns[poll._id] = `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
        } else {
          newCountdowns[poll._id] = "00:00";
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [polls]);

  const isPollExpired = (poll: any) => new Date(poll.expiresAt) < new Date();

  const getFinalResults = (options: any[]) => {
    const maxVotes = Math.max(...options.map((opt: any) => opt.votes));
    return options.filter((opt: any) => opt.votes === maxVotes);
  };

  const activePolls = polls.filter((poll) => poll.isActive && !isPollExpired(poll));
  const endedPolls = polls.filter((poll) => !poll.isActive || isPollExpired(poll));

  const handleLogout = () => {
    Cookies.remove("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-gray-300">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-r from-blue-300 to-gray-400 p-6 shadow-lg flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-8">Admin Panel</h2>
          <nav className="space-y-4">
            {["dashboard", "active", "ended"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`w-full text-left px-4 py-2 rounded ${activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-blue-900 hover:bg-blue-200"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Polls
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard label="Total Polls" value={polls.length} />
              <StatCard label="Active Polls" value={activePolls.length} />
              <StatCard label="Ended Polls" value={endedPolls.length} />
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">Poll Statistics</h3>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                {/* Pie Chart */}
                <div className="w-64 h-64">
                  <Pie
                    data={{
                      labels: ["Active", "Ended"],
                      datasets: [
                        {
                          data: [activePolls.length, endedPolls.length],
                          backgroundColor: ["#3B82F6", "#9CA3AF"],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            boxWidth: 12,
                            padding: 10,
                          },
                        },
                      },
                    }}
                  />
                </div>

                {/* Bar Chart */}
                <div className="w-full max-w-xl h-64">
                  <Bar
                    data={{
                      labels: polls.map((poll) => poll.question),
                      datasets: [
                        {
                          label: "Votes",
                          data: polls.map((poll) =>
                            poll.options.reduce((sum: number, opt: any) => sum + (opt.votes || 0), 0)
                          ),
                          backgroundColor: "#3B82F6",
                          borderRadius: 8,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        x: {
                          ticks: {
                            maxRotation: 45,
                            minRotation: 0,
                            autoSkip: true,
                          },
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function (value: string | number) {
                              return Number(value).toFixed(0);
                            },
                            stepSize: 1,
                            autoSkip: true,
                            maxTicksLimit: 6,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "active" && (
          <PollSection title="Active Polls" polls={activePolls} results={liveResults} countdowns={countdowns} />
        )}

        {activeTab === "ended" && (
          <PollSection title="Ended Polls" polls={endedPolls} results={liveResults} isEnded getFinalResults={getFinalResults} />
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gradient-to-r from-blue-300 to-gray-400 rounded-3xl p-6 shadow">
      <h3 className="text-xl font-semibold text-blue-900">{label}</h3>
      <p className="text-4xl text-blue-800 mt-4">{value}</p>
    </div>
  );
}

function PollSection({
  title,
  polls,
  results,
  countdowns,
  isEnded = false,
  getFinalResults,
}: {
  title: string;
  polls: any[];
  results: Record<string, any>;
  countdowns?: Record<string, string>;
  isEnded?: boolean;
  getFinalResults?: (options: any[]) => any[];
}) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-blue-900 mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls.map((poll) => {
          const resultData = results[poll._id]?.results || poll.options;
          const winners = isEnded && getFinalResults ? getFinalResults(resultData) : [];

          return (
            <div
              key={poll._id}
              className="bg-gradient-to-r from-blue-300 to-gray-400 rounded-3xl p-6 shadow"
            >
              <h3 className="text-xl font-semibold text-blue-900">{poll.question}</h3>
              {countdowns && (
                <p className="text-sm text-blue-700 mt-1 mb-2">
                  ⏳ Time Left:{" "}
                  <span className="font-semibold">{countdowns[poll._id] || "..."}</span>
                </p>
              )}
              <ul className="mt-3 space-y-1">
                {resultData.map((opt: any, i: number) => (
                  <li key={i} className="text-blue-800">
                    {opt.option || opt.text} -{" "}
                    <span className="font-semibold">{opt.votes}</span> votes
                  </li>
                ))}
              </ul>
              {isEnded && winners.length > 0 && (
                <div className="mt-4 text-red-800 font-semibold">
                  <p>📛 Poll Ended</p>
                  {winners.length > 1 ? (
                    <p>🏁 It's a tie: {winners.map((w) => w.option || w.text).join(", ")}</p>
                  ) : (
                    <p>🏆 Winner: {winners[0].option || winners[0].text}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
