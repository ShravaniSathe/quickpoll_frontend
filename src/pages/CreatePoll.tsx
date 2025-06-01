import { useState, useEffect } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";
import { getCookie, setCookie } from "../utils/cookie";
import { v4 as uuidv4 } from "uuid";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigate = useNavigate();

  const savePollIdToLocalStorage = (pollId: string) => {
    const savedPolls = JSON.parse(localStorage.getItem("myPolls") || "[]");
    if (!savedPolls.includes(pollId)) {
      savedPolls.push(pollId);
      localStorage.setItem("myPolls", JSON.stringify(savedPolls));
    }
  };

  useEffect(() => {
    let userId = getCookie("userId");
    if (!userId) {
      userId = uuidv4();
      setCookie("userId", userId);
    }
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setIsSubmitted(false);
        setQuestion("");
        setOptions(["", "", "", ""]);
        setDuration(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleChangeOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsSubmitted(false);
    const filteredOptions = options.filter(opt => opt.trim() !== "");
    if (!question.trim() || filteredOptions.length < 2) return;

    try {
      const userId = getCookie("userId");
      const res = await axios.post("/api/polls/create", {
        question,
        options: filteredOptions,
        duration,
        userId
      });

      const createdPoll = res.data;
      savePollIdToLocalStorage(createdPoll._id); // ✅ Save poll ID
      setIsSubmitted(true);
      navigate("/participant");
    } catch (error) {
      console.error("Error creating poll", error);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-300 p-4 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-300 to-gray-400 rounded-3xl shadow-xl p-8 max-w-xl w-full animate-fade-in-up">
        <h2 className="text-3xl font-bold mb-6 text-blue-900 text-center drop-shadow-md">Create a New Poll</h2>

        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Enter your question"
          className="w-full p-3 border border-blue-200 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block mb-2 font-semibold text-blue-900">Options</label>
        {[0, 1, 2, 3].map((idx) => (
          <input
            key={idx}
            value={options[idx] || ""}
            onChange={e => handleChangeOption(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            className="w-full p-2.5 border border-blue-200 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ))}

        <div className="mb-5">
          <label className="block mb-2 font-semibold text-blue-900">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full p-3 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={handleSubmit}
          className={`${isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-3 rounded-lg w-full font-semibold shadow transition`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : isSubmitted ? "Submitted!" : "Submit Poll"}
        </button>
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
