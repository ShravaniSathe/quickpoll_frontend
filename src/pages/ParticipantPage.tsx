import { useEffect, useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useRef } from "react";

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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pollIdFromUrl = queryParams.get("pollId");

  const pollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [copiedPollId, setCopiedPollId] = useState<string | null>(null);

  const copyLinkToClipboard = (pollId: string) => {
    const link = `${window.location.origin}/participant?pollId=${pollId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedPollId(pollId);
      setTimeout(() => setCopiedPollId(null), 2000);
    });
  };


  useEffect(() => {
    axios.get("/api/polls")
      .then(res => {
        const activePolls = res.data.filter((poll: Poll) => poll.isActive);
        setPolls(activePolls);

        // If URL has pollId, set selectedPollId after data is set
        if (pollIdFromUrl) {
          setTimeout(() => {
            setSelectedPollId(pollIdFromUrl);

            // Scroll to the poll after a slight delay
            const targetRef = pollRefs.current[pollIdFromUrl];
            if (targetRef) {
              targetRef.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 100); // Slight delay to ensure DOM is rendered
        }
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
            ref={(el) => (pollRefs.current[poll._id] = el)}
            className={`bg-gradient-to-r from-blue-300 to-gray-400 rounded-3xl p-6 shadow transition relative 
    ${selectedPollId === poll._id ? "ring-4 ring-yellow-400 animate-pulse" : ""}
  `}
          >
            <div className="flex justify-between items-center">
              <h3
                className="text-xl font-semibold text-blue-900 cursor-pointer"
                onClick={() => {
                  setSelectedPollId(prev => (prev === poll._id ? null : poll._id));
                  setSelectedOptionIndex(null);
                }}
              >
                {poll.question}
              </h3>

              {/* Copy Icon */}
              <button
                onClick={() => copyLinkToClipboard(poll._id)}
                title="Copy poll link"
                className="text-sm text-blue-900 bg-white rounded px-2 py-1 hover:bg-blue-100 border ml-4"
              >
                📋
              </button>
            </div>

            {/* Show "Copied!" confirmation */}
            {copiedPollId === poll._id && (
              <div className="absolute top-2 right-12 text-green-700 text-xs font-semibold">
                Copied!
              </div>
            )}

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

      <button
        onClick={() => navigate("/")}
        className="
    fixed 
    left-1/2 
    bottom-6 
    transform 
    -translate-x-1/2 

    md:top-8 
    md:left-8 
    md:bottom-8
    md:transform-none

    bg-blue-600 
    hover:bg-blue-700 
    text-white 
    rounded-full 
    w-16 
    h-16 
    flex 
    items-center 
    justify-center 
    text-xl 
    font-bold 
    shadow-lg 
    transition
  "
        title="Go to Home"
      >
        🏠
      </button>
    </div>
  );
}
