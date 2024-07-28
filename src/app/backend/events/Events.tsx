"use client";

import { Select, Pagination, DatePicker } from "antd";
import { useState, useEffect } from "react";
import client from "@/appwrite/config";
import { Databases, ID, Query } from 'appwrite';
import type { DatePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import EventBox from "./EventBox";

interface Event {
    Opposition?: string;
    Discipline: string;
    status: string;
    Result: string;
    BeginsAt: Date;
    Time: string;
}

interface FetchResponse {
    $id: string;
    Opposition?: string;
    Discipline: string;
    status: string;
    Result: string;
    BeginsAt: string;
    Time: string;
}

export default function Events() {
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [events, setEvents] = useState<Event>({
        Opposition: "",
        Discipline: "",
        status: "",
        Result: "",
        BeginsAt: new Date(),
        Time: ""
    });
    const [eventList, setEventList] = useState<FetchResponse[]>([]);
    const [editingEvent, setEditingEvent] = useState<FetchResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 25;

    const fetchEvents = async (page: number) => {
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
        } catch (error: any) {
            console.error("Error fetching events:", error);
            setError("Failed to fetch events");
        }
    };

    useEffect(() => {
        fetchEvents(currentPage);
    }, [currentPage]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEvents(prevEvents => ({
            ...prevEvents,
            [event.target.name]: event.target.value
        }));
    };

    const handleOppositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEvents(prevEvents => ({
            ...prevEvents,
            Opposition: event.target.value ? event.target.value : "https://victormochere.com/wp-content/uploads/2020/10/Top-20-countries-with-the-most-Olympic-medals-in-the-world.jpg"
        }));
    };

    const handleSelectChange = (value: string, field: keyof Event) => {
        setEvents(prevEvents => ({
            ...prevEvents,
            [field]: value
        }));
    };

    const handleDateChange: DatePickerProps['onChange'] = (date: Dayjs | null, dateString: string | string[]) => {
        if (typeof dateString === 'string') {
            setEvents(prevEvents => ({
                ...prevEvents,
                BeginsAt: date ? date.toDate() : new Date()
            }));
        } else if (Array.isArray(dateString)) {
            setEvents(prevEvents => ({
                ...prevEvents,
                BeginsAt: date ? date.toDate() : new Date()
            }));
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const indexOfLastEvent = currentPage * perPage;
    const indexOfFirstEvent = indexOfLastEvent - perPage;
    const currentEvents = eventList.slice(indexOfFirstEvent, indexOfLastEvent);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setIsLoaded(true);
            const db = new Databases(client);
            if (editingEvent) {
                await db.updateDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID!,
                    editingEvent.$id,
                    { ...events, BeginsAt: events.BeginsAt.toISOString() }
                );
            } else {
                await db.createDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID!,
                    ID.unique(),
                    { ...events, BeginsAt: events.BeginsAt.toISOString() }
                );
            }
            setSuccess(true);
            setEvents({
                Opposition: "",
                Discipline: "",
                status: "",
                Result: "",
                BeginsAt: new Date(),
                Time: ""
            });
            fetchEvents(currentPage);
        } catch (error: any) {
            console.error("Error creating event:", error);
            setError("Failed to create event");
        }
        setIsLoaded(false);
        setEditingEvent(null);
    };

    const handleEdit = (event: FetchResponse) => {
        setEditingEvent(event);
        setEvents({
            Opposition: event.Opposition,
            Discipline: event.Discipline,
            status: event.status,
            Result: event.Result,
            BeginsAt: new Date(event.BeginsAt),
            Time: event.Time
        });
    };

    const handleDelete = async (event: FetchResponse) => {
        try {
            const db = new Databases(client);
            await db.deleteDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID!,
                event.$id
            );
            setEventList(prevList => prevList.filter(item => item.$id !== event.$id));
        } catch (error: any) {
            console.error("Error deleting event:", error);
            setError("Failed to delete event");
        }
    };

    return (
        <>
            <div className="p-8 bg-gray-100 min-h-screen">
                {error && (
                    <div className="mb-4 p-4 text-red-600 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 text-green-600 bg-green-100 rounded-lg">
                        {editingEvent ? "Event details updated successfully!" : "Event details uploaded successfully!"}
                    </div>
                )}
                <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        {editingEvent ? "Edit Event Details" : "Upload Event Details"}
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                       
                        <div>
                            <label className="block text-gray-700">Opposition:</label>
                            <input
                                type="text"
                                name="Opposition"
                                value={events.Opposition}
                                onChange={handleOppositionChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Discipline:</label>
                            <input
                                type="text"
                                name="Discipline"
                                value={events.Discipline}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <Select
                                className="w-full mt-1"
                                value={events.status}
                                onChange={(value) => handleSelectChange(value, "status")}
                                options={[
                                    { value: 'upcoming', label: 'Upcoming' },
                                    { value: 'ongoing', label: 'Ongoing' },
                                    { value: 'completed', label: 'Completed' },
                                    { value: 'canceled', label: 'Canceled' }
                                ]}
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="Result" className="block text-sm font-medium text-gray-700">Result</label>
                            <Select
                                className="w-full mt-1"
                                value={events.Result}
                                onChange={(value) => handleSelectChange(value, "Result")}
                                options={[
                                    { value: 'Gold', label: 'Gold' },
                                    { value: 'Silver', label: 'Silver' },
                                    { value: 'Bronze', label: 'Bronze' },
                                    { value: 'Out', label: 'Out' },
                                    { value: 'Qualified', label: 'Qualified' },
                                    { value: 'Disqualified', label: 'Disqualified' },
                                    { value: 'Abandoned', label: 'Abandoned' },
                                    { value: 'Waiting', label: 'Waiting' },
                                    {value:'repechage',label:'Repechage'},
                                    {value:'Win',label:'Win'},
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Begins At:</label>
                            <DatePicker
                                value={dayjs(events.BeginsAt)}
                                onChange={handleDateChange}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Time:</label>
                            <input
                                type="text"
                                name="Time"
                                value={events.Time}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded">
                            {isLoaded ? "Saving..." : "Submit"}
                        </button>
                    </form>
                </div>
                <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg mt-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Event List</h1>
                    <div className="space-y-4">
                        {currentEvents.map((event) => (
                            <div key={event.$id} className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-between items-center">
                                <EventBox
                                    Opposition={event.Opposition}
                                    Discipline={event.Discipline}
                                    status={event.status}
                                    Result={event.Result}
                                    Time={event.Time}
                                    BeginsAt={dayjs(event.BeginsAt).format('MMMM D, YYYY')}
                                />
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="bg-yellow-500 text-white py-1 px-2 rounded"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event)}
                                        className="bg-red-500 text-white py-1 px-2 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination
                        current={currentPage}
                        pageSize={perPage}
                        total={eventList.length}
                        onChange={handlePageChange}
                        className="mt-4"
                    />
                </div>
            </div>
        </>
    );
}
