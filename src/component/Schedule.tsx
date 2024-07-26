"use client";

import { DatePicker, Spin, Image } from "antd";
import { useState, useEffect } from "react";
import client from "@/appwrite/config";
import { Databases, Query } from 'appwrite';
import type { DatePickerProps } from 'antd';
import dayjs from 'dayjs';

interface FetchResponse {
    $id: string;
    Opposition?: string;
    Discipline: string;
    status: string;
    Result: string;
    BeginsAt: string;
    Time: string;
}

export default function Schedule() {
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [eventList, setEventList] = useState<FetchResponse[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<FetchResponse[]>([]);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoaded(true);
        setError(null);
        try {
            const db = new Databases(client);
            const response = await db.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID!,
                [Query.limit(1000)]
            );

            const transformedEvents: FetchResponse[] = response.documents.map((doc: any) => ({
                $id: doc.$id,
                Opposition: doc.Opposition,
                Discipline: doc.Discipline,
                status: doc.status,
                Result: doc.Result,
                BeginsAt: doc.BeginsAt,
                Time: doc.Time
            }));

            setEventList(transformedEvents);
            setFilteredEvents(transformedEvents);
        } catch (error: any) {
            console.error("Error fetching events:", error);
            setError("Failed to fetch events");
        } finally {
            setIsLoaded(false);
        }
    };

    const handleDateChange: DatePickerProps['onChange'] = (date) => {
        setSelectedDate(date);
        if (date) {
            const filtered = eventList.filter(event => dayjs(event.BeginsAt).isSame(date, 'day'));
            setFilteredEvents(filtered);
        } else {
            setFilteredEvents(eventList);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-black p-8 shadow-lg rounded-lg my-4">
            <h1 className="text-3xl font-bold mb-4 text-white">Schedule</h1>
            <DatePicker onChange={handleDateChange} className="mb-4 p-2 w-full" />
            {error && (
                <div className="mb-4 p-4 text-red-600 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}
            {isLoaded ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <div>
                    {filteredEvents.length === 0 ? (
                        <div className="text-white bg-black text-center">No events found for the selected date.</div>
                    ) : (
                        <ul className="space-y-4">
                        {filteredEvents.map(event => (
                            <li key={event.$id} className={(event.status==="completed" || event.status==="Abandoned") ?"bg-red-500  p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center":"bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center"}>
                                <Image
                                    src="/images/india.jpg"
                                    alt="India"
                                    className="w-full h-48 md:w-1/3 md:h-auto object-cover rounded-md shadow-md"
                                />
                                <div className="flex-1 mx-4 my-4 md:my-0 text-center ">
                                    <div className="text-2xl text-gray-800 font-bold">{event.Discipline}</div>
                                    <div className="text-gray-600">Status: {event.status}</div>
                                    <div className="text-gray-600">Result: {event.Result}</div>
                                    <div className="text-gray-600">
                                        Date: {dayjs(event.BeginsAt).format('MMMM D, YYYY')}
                                    </div>
                                    <div className="text-gray-600">Time: {event.Time}</div>
                                </div>
                                <Image
                                    src={event.Opposition || '/images/world.jpg'}
                                    alt="Opposition"
                                    className="w-full h-48 md:w-1/3 md:h-auto object-fill rounded-md shadow-md"
                                    width={150}
                                    height={150}
                                    style={{ marginLeft: "10px" }}
                                />
                            </li>
                        ))}
                    </ul>
                    
                    )}
                </div>
            )}
        </div>

    );
}
