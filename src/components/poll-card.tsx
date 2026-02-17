"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POLL_DATA = {
    id: 1,
    question: "Which public facility needs immediate upgrade?",
    options: [
        { id: "opt1", text: "Central Park Playground", votes: 124 },
        { id: "opt2", text: "City Library WiFi", votes: 89 },
        { id: "opt3", text: "Downtown Bus Stops", votes: 205 },
        { id: "opt4", text: "Public Toilets in Market", votes: 156 },
    ],
    totalVotes: 574,
};

export default function PollCard() {
    const [voting, setVoting] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [poll, setPoll] = useState(POLL_DATA);

    const handleVote = (optionId: string) => {
        setSelectedOption(optionId);
        setVoting(true);

        // Simulate API call
        setTimeout(() => {
            setPoll((prev) => ({
                ...prev,
                options: prev.options.map((opt) =>
                    opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
                ),
                totalVotes: prev.totalVotes + 1,
            }));
            setHasVoted(true);
            setVoting(false);
        }, 1500);
    };

    const maxVotes = Math.max(...poll.options.map((o) => o.votes));

    return (
        <Card className="glass-card mb-8 overflow-hidden border-primary/20">
            <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                    <BarChart3 className="size-5 text-primary" />
                    Community Poll
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-6">{poll.question}</h3>

                <div className="space-y-4">
                    {poll.options.map((option) => {
                        const percent = Math.round((option.votes / poll.totalVotes) * 100);
                        const isSelected = selectedOption === option.id;

                        return (
                            <div key={option.id} className="relative group">
                                {/* Result Bar (Background) */}
                                {hasVoted && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        className={cn(
                                            "absolute top-0 bottom-0 left-0 rounded-lg -z-10 bg-primary/10",
                                            isSelected && "bg-primary/20"
                                        )}
                                    />
                                )}

                                <button
                                    onClick={() => !hasVoted && handleVote(option.id)}
                                    disabled={hasVoted || voting}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-lg border transition-all text-left relative z-0",
                                        hasVoted
                                            ? "border-transparent cursor-default"
                                            : "border-border hover:border-primary/50 hover:bg-primary/5",
                                        isSelected && hasVoted && "border-primary/30 ring-1 ring-primary/30"
                                    )}
                                >
                                    <span className="font-medium flex items-center gap-2">
                                        {isSelected && hasVoted && (
                                            <CheckCircle2 className="size-4 text-primary" />
                                        )}
                                        {option.text}
                                    </span>

                                    {hasVoted ? (
                                        <span className="font-bold tabular-nums text-sm">
                                            {percent}% <span className="text-muted-foreground font-normal ml-1">({option.votes})</span>
                                        </span>
                                    ) : (
                                        (voting && isSelected) && <Loader2 className="size-4 animate-spin text-primary" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 text-xs text-muted-foreground text-center">
                    Total votes: {poll.totalVotes.toLocaleString()} • Poll ends in 2 days
                </div>
            </CardContent>
        </Card>
    );
}
