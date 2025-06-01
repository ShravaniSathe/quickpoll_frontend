import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "../api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const socket = io(import.meta.env.VITE_API_LINK);

export default function MyPollsPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [liveResults, setLiveResults] = useState<Record<string, any>>({});
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  

  useEffect(() => {
    const userId = Cookies.get("userId");
    if (!userId) return;

    axios
      .get(`/api/polls/mypolls?userId=${userId}`)
      .then((res) => {
        setPolls(res.data);
        res.data.forEach((poll: any) => {
          socket.emit("joinPollRoom", poll._id);
        });
      })
      .catch((err) => {
        console.error("Failed to fetch user polls", err);
      });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-gray-300 overflow-hidden p-8">
      <h2 className="text-3xl font-bold mb-8 text-blue-900 text-center drop-shadow-md">
        My Polls (Live)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {polls.map((poll) => {
          const resultData = liveResults[poll._id]?.results || poll.options;
          const expired = isPollExpired(poll);
          const winners = expired ? getFinalResults(resultData) : [];

          return (
            <div
              key={poll._id}
              className="bg-gradient-to-r from-blue-300 to-gray-400 rounded-3xl p-6 shadow transition"
            >
              <h3 className="text-xl font-semibold text-blue-900">{poll.question}</h3>

              {!expired && (
                <p className="text-sm text-blue-800 mt-1 mb-2">
                  ⏳ Time Left: <span className="font-semibold">{countdowns[poll._id] || "..."}</span>
                </p>
              )}

              <ul className="mt-3 space-y-1">
                {resultData.map((opt: any, i: number) => (
                  <li key={i} className="text-blue-900">
                    {opt.option || opt.text} - <span className="font-semibold">{opt.votes}</span> votes
                  </li>
                ))}
              </ul>

              {expired && (
                <div className="mt-4 text-blue-900 font-semibold">
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
      <button
        onClick={() => navigate("/participant")}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold shadow-lg transition"
        title="Create Poll"
      >
        👤
      </button>
    </div>
  );
}
