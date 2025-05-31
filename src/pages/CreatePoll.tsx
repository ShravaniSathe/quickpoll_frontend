import { useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(60); // in minutes
  const navigate = useNavigate();

  const savePollIdToLocalStorage = (pollId: string) => {
    const savedPolls = JSON.parse(localStorage.getItem("myPolls") || "[]");
    if (!savedPolls.includes(pollId)) {
      savedPolls.push(pollId);
      localStorage.setItem("myPolls", JSON.stringify(savedPolls));
    }
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleChangeOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    const filteredOptions = options.filter(opt => opt.trim() !== "");
    if (!question.trim() || filteredOptions.length < 2) return;

    try {
      const res = await axios.post("/api/polls/create", {
        question,
        options: filteredOptions,
        duration
      });

      const createdPoll = res.data;
      savePollIdToLocalStorage(createdPoll._id); // ✅ Save poll ID
      navigate("/participant");
    } catch (error) {
      console.error("Error creating poll", error);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-300 p-4 overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-300 to-gray-400 rounded-3xl shadow-xl p-8 max-w-xl w-full animate-fade-in-up"
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-900 text-center drop-shadow-md">Create a New Poll</h2>

        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Enter your question"
          className="w-full p-3 border border-blue-200 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="block mb-2 font-semibold text-blue-900">Options</label>
        {options.map((opt, idx) => (
          <input
            key={idx}
            value={opt}
            onChange={e => handleChangeOption(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            className="w-full p-3 border border-blue-200 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ))}

        <button
          onClick={handleAddOption}
          className="bg-white text-blue-700 border border-blue-500 px-4 py-2 rounded hover:bg-blue-100 transition mb-6"
        >
          + Add Option
        </button>

        <div className="mb-6">
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full font-semibold shadow transition"
        >
          Submit Poll
        </button>
      </div>
    </div>
  );
}
