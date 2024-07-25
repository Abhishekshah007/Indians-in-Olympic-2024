"use client";
import { useState, useEffect } from "react";
import { Button } from "antd";
import Athletes from "../athletes/Athletes";
import Events from "../events/Events";
import Tally from "../tally/Tally";
import Cards from "../breakingNews/cards/Cards";
import Navbar from "@/component/Navbar";
import { useRouter } from "next/navigation";


export default function Pages() {
    const [view, setView] = useState("Athletes");
    const history = useRouter();


    useEffect(() => {
        const checkSession = async () => {
            try {
                const sessionExists = localStorage.getItem("cookieFallback");

                if (!sessionExists) {
                    history.push("/backend/login");
                }
            } catch (error) {
                console.error("Error checking session:", error);

            }
        };

        checkSession();
    }, [history]);

    const renderView = () => {
        switch (view) {
            case "Athletes":
                return <Athletes />;
            case "Events":
                return <Events />;
            case "Tally":
                return <Tally />;
            case "Cards":
                return <Cards />;
            default:
                return <Athletes />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center bg-black">
            <Navbar />
            <div className="w-full flex justify-center m-6">
                <Button type="primary" onClick={() => setView("Athletes")} className="mr-2">
                    Athletes
                </Button>
                <Button type="primary" onClick={() => setView("Events")} className="mr-2">
                    Events
                </Button>
                <Button type="primary" onClick={() => setView("Tally")} className="mr-2">
                    Tally
                </Button>
                <Button type="primary" onClick={() => setView("Cards")}>
                    Cards
                </Button>
            </div>
            <div className="w-full flex justify-center">
                {renderView()}
            </div>
        </div>
    );
}
