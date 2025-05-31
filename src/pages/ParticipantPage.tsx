import { useEffect, useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";

interface Option {
  text: string;
  votes: number;
  _id: string;
}

interface Poll {
  _id: string;
  question: string;
  options: Option[];
  isActive: boolean;
  duration?: number;
}

export default function ParticipantPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [votedPollId, setVotedPollId] = useState<string | null>(null);
  const [loadingVote, setLoadingVote] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/polls")
      .then(res => {
        const activePolls = res.data.filter((poll: Poll) => poll.isActive);
        setPolls(activePolls);
      })
      .catch(err => console.error("Error fetching polls:", err));
  }, []);

  const castVote = () => {
    if (!selectedPollId || selectedOptionIndex === null) return;

    setLoadingVote(true);
    axios.post("/api/polls/vote", {
      pollId: selectedPollId,
      optionIndex: selectedOptionIndex,
    })
      .then(() => {
        setVotedPollId(selectedPollId);
        setSelectedOptionIndex(null);
        setLoadingVote(false);
      })
      .catch(err => {
        console.error("Error submitting vote:", err);
        setLoadingVote(false);
      });
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-start items-center bg-gradient-to-br from-blue-100 to-gray-300 overflow-hidden p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-900 drop-shadow-md">Active Polls</h2>

      <div className="space-y-4 max-w-xl w-full">
        {polls.map(poll => (
          <div
            key={poll._id}
            className="bg-gradient-to-r from-blue-300 to-gray-400 rounded-3xl p-6 shadow transition"
          >
            <h3
              className="text-xl font-semibold text-blue-900 cursor-pointer"
              onClick={() => {
                setSelectedPollId(prev => (prev === poll._id ? null : poll._id));
                setSelectedOptionIndex(null);
              }}
            >
              {poll.question}
            </h3>

            {selectedPollId === poll._id && (
              <div className="mt-4 space-y-3">
                {poll.options.map((opt, i) => (
                  <button
                    key={opt._id}
                    disabled={votedPollId === poll._id}
                    onClick={() => setSelectedOptionIndex(i)}
                    className={`w-full rounded px-4 py-2 border border-blue-600 text-blue-900 font-semibold transition
              ${votedPollId === poll._id
                        ? i === selectedOptionIndex
                          ? "bg-blue-300 cursor-default"
                          : "bg-white cursor-default"
                        : selectedOptionIndex === i
                          ? "bg-blue-200"
                          : "hover:bg-blue-100 bg-blue-50 cursor-pointer"
                      }`}
                  >
                    {opt.text}
                  </button>
                ))}

                {/* Submit button appears here, just below the options */}
                {votedPollId !== poll._id && selectedOptionIndex !== null && (
                  <button
                    onClick={castVote}
                    disabled={loadingVote}
                    className="mt-4 w-1/2 mx-auto block bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold transition"
                  >
                    {loadingVote ? "Submitting..." : "Submit Vote"}
                  </button>
                )}

                {/* Message if vote is already submitted */}
                {votedPollId === poll._id && (
                  <div className="mt-4 w-1/2 mx-auto bg-blue-600 text-white text-center rounded px-4 py-2 font-semibold">
                    Vote submitted
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Submit Button */}
      {/* {selectedPollId && selectedOptionIndex !== null && votedPollId !== selectedPollId && (
        <button
          onClick={castVote}
          disabled={loadingVote}
          className="fixed bottom-24 right-8 bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-3 font-semibold shadow-lg transition animate-fade-in-up"
        >
          {loadingVote ? "Submitting..." : "Submit Vote"}
        </button>
      )} */}

      {/* Create Poll Button */}
      <button
        onClick={() => navigate("/create")}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold shadow-lg transition"
        title="Create Poll"
      >
        +
      </button>
      <button
        onClick={() => navigate("/mypolls")}
        className="fixed bottom-8 left-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold shadow-lg transition"
        title="My Polls"
      >
        🗳️
      </button>

    </div>
  );
}
