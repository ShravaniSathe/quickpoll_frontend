import { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "../api";

const socket = io(import.meta.env.VITE_API_LINK); // Ensure this matches backend

export default function MyPollsPage() {
    const [polls, setPolls] = useState<any[]>([]);
    const [liveResults, setLiveResults] = useState<Record<string, any>>({});

    useEffect(() => {
        const savedPollIds = JSON.parse(localStorage.getItem("myPolls") || "[]");

        axios.get("/api/polls").then(res => {
            const userPolls = res.data.filter((poll: any) => savedPollIds.includes(poll._id));
            setPolls(userPolls);

            userPolls.forEach((poll: any) => {
                socket.emit("joinPollRoom", poll._id); // Join poll room
            });
        });

        socket.on("pollResultsUpdate", (data) => {
            setLiveResults(prev => ({
                ...prev,
                [data._id]: data,
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);


    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">My Polls (Live)</h2>
            {polls.map(poll => (
                <div key={poll._id} className="bg-white p-4 rounded shadow mb-4">
                    <h3 className="text-lg font-semibold">{poll.question}</h3>
                    <ul className="mt-2 space-y-1">
                        {(liveResults[poll._id]?.results || poll.options).map((opt: any, i: number) => (
                            <li key={i}>
                                {opt.option || opt.text} - {opt.votes} votes
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}