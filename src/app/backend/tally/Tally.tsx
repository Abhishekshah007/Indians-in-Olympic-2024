"use client";
"use client";
import { Empty, Select } from "antd";
import { useState, useEffect, useCallback } from "react";
import client from "@/appwrite/config";
import { Databases, ID, Query } from 'appwrite';

interface Tally {
    Games: string;
    Silver: string;
    Gold: string;
    Bronze: string;
}

interface FetchResponse {
    $id: string;
    Games: string;
    Silver: number;
    Gold: number;
    Bronze: number;
}

export default function Tally() {
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [tally, setTally] = useState<Tally>({
        Games: "",
        Silver: "",
        Gold: "",
        Bronze: ""
    });
    const [editId, setEditId] = useState<string | null>(null);
    const [tallyList, setTallyList] = useState<FetchResponse[]>([]);

    const fetchTally = useCallback(async () => {
        try {
            const db = new Databases(client);
            const response = await db.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_TALLY_COLLECTION_ID!,
                [Query.limit(1000)]
            );

            const transformedTallies: FetchResponse[] = response.documents.map((doc: any) => ({
                $id: doc.$id,
                Games: doc.Games,
                Silver: doc.Silver,
                Gold: doc.Gold,
                Bronze: doc.Bronze
            }));

            setTallyList(transformedTallies);
        } catch (error: any) {
            console.error("Error fetching tally:", error);
            setError("Failed to fetch tally");
        }
    }, []);

    useEffect(() => {
        fetchTally();
    }, [fetchTally]);

    const handleSelectChange = (value: string) => {
        setTally(prevTally => ({
            ...prevTally,
            Games: value
        }));
    };

    const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setTally(prevTally => ({
            ...prevTally,
            [name]: value
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setIsLoaded(true);
            const db = new Databases(client);
            const updatedTally = {
                Games: tally.Games,
                Silver: Number(tally.Silver),
                Gold: Number(tally.Gold),
                Bronze: Number(tally.Bronze)
            };
            if (editId) {
                await db.updateDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_TALLY_COLLECTION_ID!,
                    editId,
                    updatedTally
                );
                setEditId(null);
            } else {
                await db.createDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_TALLY_COLLECTION_ID!,
                    ID.unique(),
                    updatedTally
                );
            }
            setSuccess(true);
            setTally({
                Games: "",
                Silver: "",
                Gold: "",
                Bronze: ""
            });
            fetchTally();
        } catch (error: any) {
            console.error("Error creating/updating tally:", error);
            setError("Failed to create/update tally");
        }
        setIsLoaded(false);
    };

    const handleDelete = async (tally: FetchResponse) => {
        try {
            const db = new Databases(client);
            await db.deleteDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_TALLY_COLLECTION_ID!,
                tally.$id
            );
            fetchTally();
        } catch (error: any) {
            console.error("Error deleting tally:", error);
            setError("Failed to delete tally");
        }
    };

    const handleEdit = (tally: FetchResponse) => {
        setTally({
            Games: tally.Games,
            Silver: tally.Silver.toString(),
            Gold: tally.Gold.toString(),
            Bronze: tally.Bronze.toString()
        });
        setEditId(tally.$id);
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
                        Tally {editId ? "updated" : "created"} successfully!
                    </div>
                )}
                <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">{editId ? "Edit" : "Create"} Tally</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="Games" className="block text-sm font-medium text-gray-700">Game</label>
                            <Select
                                className="w-full mt-1"
                                value={tally.Games}
                                onChange={handleSelectChange}
                                options={[
                                    { value: 'Hockey', label: 'Hockey' },
                                    { value: 'Table Tennis', label: 'Table Tennis' },
                                    { value: 'Golf', label: 'Golf' },
                                    { value: 'Equestrian', label: 'Equestrian' },
                                    { value: 'Athletics', label: 'Athletics' },
                                    { value: 'Wrestling', label: 'Wrestling' },
                                    { value: 'Boxing', label: 'Boxing' },
                                    { value: 'Shooting', label: 'Shooting' },
                                    { value: 'Tennis', label: 'Tennis' },
                                    { value: 'Archery', label: 'Archery' },
                                    { value: 'Badminton', label: 'Badminton' },
                                    { value: 'Swimming', label: 'Swimming' },
                                    { value: 'Sailing', label: 'Sailing' },
                                    { value: 'Judo', label: 'Judo' },
                                    { value: 'Rowing', label: 'Rowing' },
                                    { value: 'Weightlifting', label: 'Weightlifting' }
                                ]}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="Gold" className="block text-sm font-medium text-gray-700">Gold</label>
                            <input
                                type="number"
                                name="Gold"
                                value={tally.Gold}
                                onChange={handleNumberChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="Silver" className="block text-sm font-medium text-gray-700">Silver</label>
                            <input
                                type="number"
                                name="Silver"
                                value={tally.Silver}
                                onChange={handleNumberChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="Bronze" className="block text-sm font-medium text-gray-700">Bronze</label>
                            <input
                                type="number"
                                name="Bronze"
                                value={tally.Bronze}
                                onChange={handleNumberChange}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>

                        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded">
                            {isLoaded ? "Saving..." : "Submit"}
                        </button>
                    </form>
                </div>
                <div className="mt-12 max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Medal Tally</h1>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Game
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Gold
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Silver
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Bronze
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500
uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        {tallyList.length <= 0 ? (
                            <tbody>
                                <tr>
                                    <td colSpan={5}>
                                        <Empty description="No data" />
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody className="bg-white divide-y divide-gray-200">
                                {tallyList.map((tally, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap">{tally.Games}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{tally.Gold}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{tally.Silver}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{tally.Bronze}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleDelete(tally)}
                                                className="bg-red-500 text-white px-6 py-2 rounded-md shadow-sm hover focus"
                                            >
                                                Delete
                                            </button>
                                            <button onClick={() => handleEdit(tally)} className="bg-blue-500 text-white px-6 py-2 rounded-md shadow-sm hover focus ml-2">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </>
    );
}