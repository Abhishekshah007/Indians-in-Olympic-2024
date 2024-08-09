"use client";

import { Select, Pagination,Image } from "antd";
import { useState, useEffect } from "react";
import client from "@/appwrite/config";
import { Databases, ID, Query } from 'appwrite';

interface Athlete {
    Name: string;
    Image: string;
    Discipline: string;
    IsOut: boolean;
    MedalType: string;
}

interface FetchResponse {
    $id: string;
    Name: string;
    Image: string;
    Discipline: string;
    IsOut: boolean;
    MedalType: string;
}

export default function Athletes() {
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [athletes, setAthletes] = useState<Athlete>({
        Name: "",
        Image: "",
        Discipline: "",
        IsOut: false,
        MedalType: ""
    });
    const [athleteList, setAthleteList] = useState<FetchResponse[]>([]);
    const [editingAthlete, setEditingAthlete] = useState<FetchResponse | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 25;

    const fetchAthletes = async (page: number) => {
        try {
            const db = new Databases(client);
            const response = await db.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_ATHELETES_COLLECTION_ID!,
                [Query.limit(1000)]
            );

            const transformedAthletes: FetchResponse[] = response.documents.map((doc: any) => ({
                $id: doc.$id,
                Name: doc.Name,
                Image: doc.Image,
                Discipline: doc.Discipline,
                IsOut: doc.IsOut,
                MedalType: doc.MedalType
            }));

            setAthleteList(transformedAthletes);
        } catch (error: any) {
            console.error("Error fetching athletes:", error);
            setError("Failed to fetch athletes");
        }
    };

    useEffect(() => {
        fetchAthletes(currentPage);
    }, [currentPage]);

    // Function to handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Calculate pagination range
    const indexOfLastBlog = currentPage * perPage;
    const indexOfFirstBlog = indexOfLastBlog - perPage;
    const currentBlogs = athleteList.slice(indexOfFirstBlog, indexOfLastBlog);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAthletes({
            ...athletes,
            [event.target.name]: event.target.value
        });
    };

    const handleSelectChange = (value: string, field: keyof Athlete) => {
        setAthletes({
            ...athletes,
            [field]: field === "IsOut" ? value === "true" : value
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setIsLoaded(true);
            const db = new Databases(client);

            if (editingAthlete) {
                await db.updateDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_ATHELETES_COLLECTION_ID!,
                    editingAthlete.$id,
                    athletes
                );
                setSuccess(true);
                setEditingAthlete(null);
                setAthleteList((prevList) => {
                    const updatedList = prevList.map((athlete) =>
                        athlete.$id === editingAthlete.$id ? { ...athlete, ...athletes } : athlete
                    );
                    return [...updatedList]; 
                });
                
            } else {
                const newAthlete = await db.createDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_ATHELETES_COLLECTION_ID!,
                    ID.unique(),
                    athletes
                );
                setSuccess(true);
                setAthleteList((prevList) => [...prevList, newAthlete as unknown as FetchResponse]);
            }

            setAthletes({
                Name: "",
                Image: "",
                Discipline: "",
                IsOut: false,
                MedalType: ""
            });
        } catch (error: any) {
            console.error(error);
            setError("Error occurred while saving athlete details");
        } finally {
            setIsLoaded(false);
        }
    };

    const handleEditClick = (athlete: FetchResponse) => {
        setEditingAthlete(athlete);
        setAthletes(athlete);
    };

    const handleCancelEdit = () => {
        setEditingAthlete(null);
        setAthletes({
            Name: "",
            Image: "",
            Discipline: "",
            IsOut: false,
            MedalType: ""
        });
    };

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {error && (
                <div className="mb-4 p-4 text-red-600 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 text-green-600 bg-green-100 rounded-lg">
                    {editingAthlete ? "Athlete details updated successfully!" : "Athlete details uploaded successfully!"}
                </div>
            )}
            <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">{editingAthlete ? "Edit Athlete Details" : "Upload Athlete Details"}</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="Name" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            placeholder="Name"
                            name="Name"
                            value={athletes.Name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="Image" className="block text-sm font-medium text-gray-700">Image</label>
                        <input
                            type="text"
                            placeholder="Image Url"
                            name="Image"
                            value={athletes.Image}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="Discipline" className="block text-sm font-medium text-gray-700">Discipline</label>
                        <input
                            type="text"
                            placeholder="Discipline"
                            name="Discipline"
                            value={athletes.Discipline}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="IsOut" className="block text-sm font-medium text-gray-700">Is Out</label>
                        <Select
                            className="w-full mt-1"
                            defaultValue="true"
                            onChange={(value) => handleSelectChange(value, "IsOut")}
                            options={[
                                { value: 'true', label: 'True' },
                                { value: 'false', label: 'False' }
                            ]}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="MedalType" className="block text-sm font-medium text-gray-700">Medal Type</label>
                        <Select
                            className="w-full mt-1"
                            value={athletes.MedalType}
                            onChange={(value) => handleSelectChange(value, "MedalType")}
                            defaultValue="None"
                            options={[
                                { value: 'Gold', label: 'Gold' },
                                { value: 'Silver', label: 'Silver' },
                                { value: 'Bronze', label: 'Bronze' },
                                { value: 'None', label: 'None' }
                            ]}
                        />
                    </div>
                    <div className="flex justify-end space-x-4">
                        {editingAthlete && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-gray-500 text-white px-6 py-2 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="bg-gray-500 text-white px-6 py-2 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {isLoaded ? "Saving..." : editingAthlete ? "Save Changes" : "Upload"}
                        </button>
                    </div>
                </form>
            </div>
            <div className="mt-12 max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Athlete Details</h1>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discipline</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Is Out</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medal Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edit</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentBlogs.map((athlete, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">{athlete.Name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Image src={athlete.Image} alt={athlete.Name} className="w-16 h-16 rounded-full" width={64} height={64} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{athlete.Discipline}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{athlete.IsOut ? "Yes" : "No"}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{athlete.MedalType}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleEditClick(athlete)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4">
                    <Pagination
                        current={currentPage}
                        pageSize={perPage}
                        total={athleteList.length}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                    />
                </div>
            </div>
        </div>
    );
}
