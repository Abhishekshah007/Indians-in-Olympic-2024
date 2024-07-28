"use client";

import { Image } from "antd";

interface EventBoxProps {
    Opposition?: string;
    Discipline: string;
    status: string;
    Result: string;
    Time: string;
    BeginsAt: string
}

export default function EventBox({
    Opposition,
    Discipline,
    status,
    Result,
    Time,
    BeginsAt
}: EventBoxProps) {
    return (
            <div className="max-w-4xl mx-auto bg-gray-800 p-8 shadow-lg rounded-lg my-4">
                <div className="flex flex-wrap items-center justify-between">
                  
                    <div className="flex flex-col text-white md:text-left md:ml-4">
                        <h4 className="text-2xl font-bold">{Discipline}</h4>
                        <p className="text-lg">{status}</p>
                        <p className="text-sm">Date {BeginsAt}</p>
                        <p className="text-sm">Time: {Time}</p>
                        <p className="text-sm">Result: {Result}</p>
                        
                    </div>
                    <Image 
                        src={Opposition}
                        alt="Opposition"
                        className="w-full md:w-1/3 mt-4 md:mt-0"
                        width={150}
                        height={150}
                    />
                </div>
            </div>
        
    );
}
