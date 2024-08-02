"use client";

import { DatePicker, Spin, Image, Card } from "antd";
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
    
            // Sort events by BeginsAt date in descending order
            const sortedEvents = transformedEvents.sort((a, b) => dayjs(a.BeginsAt).isBefore(dayjs(b.BeginsAt)) ? 1 : -1);
    
            setEventList(sortedEvents);
            setFilteredEvents(sortedEvents);
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
        <div className="max-w-4xl mx-auto bg-gray-100 p-8 shadow-lg rounded-lg my-4">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Schedule</h1>
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
                        <div className="text-gray-800 text-center">No events found for the selected date.</div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Image
                                src="/images/india.jpg"
                                alt="India"
                                className="object-cover h-48 w-48 rounded-full"
                            />
                            <span className="text-3xl font-bold my-4">vs</span>
                            <div className="flex flex-wrap justify-center gap-4">
                                {filteredEvents.map(event => (
                                    <div key={event.$id} className="w-full sm:w-1/2 lg:w-1/3">
                                        <div className="flex items-center mb-2">
                                            <span className="text-xl font-bold">{dayjs(event.BeginsAt).format('D MMMM')}</span>
                                        </div>
                                        <Card
                                            cover={
                                                <Image
                                                    src={event.Opposition || '/images/world.jpg'}
                                                    alt="Opposition"
                                                    className="object-cover h-48 w-full rounded-t-lg"
                                                />
                                            }
                                            className={`shadow-lg rounded-lg ${event.status === "completed" || event.status === "Abandoned" ? "bg-red-500" : "bg-white"}`}
                                        >
                                            <Card.Meta
                                                title={<span className="text-2xl text-gray-800 font-bold">{event.Discipline}</span>}
                                                description={
                                                    <div className="text-gray-600">
                                                        <div>Status: {event.status}</div>
                                                        <div className="bg-yellow-200 p-2 rounded-lg font-semibold text-center text-black">
                                                            Result: {event.Result}
                                                        </div>
                                                        <div>Date: {dayjs(event.BeginsAt).format('MMMM D, YYYY')}</div>
                                                        <div>Time: {event.Time}</div>
                                                    </div>
                                                }
                                            />
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
