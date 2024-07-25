"use client";

import { useState, useEffect } from "react";
import client from "@/appwrite/config";
import { Databases, Query } from 'appwrite';
import Image from "next/image";

interface FetchTally {
    $id: string;
    Silver: number;
    Gold: number;
    Bronze: number;
}

export default function MedalTally() {
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [tallyList, setTallyList] = useState<FetchTally[]>([]);

    const fetchTally = async () => {
        try {
            setIsLoaded(true);
            const db = new Databases(client);
            const response = await db.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_TALLY_COLLECTION_ID!,
                [Query.limit(1000)]
            );

            const transformedTallies: FetchTally[] = response.documents.map((doc: any) => ({
                $id: doc.$id,
                Silver: Number(doc.Silver),
                Gold: Number(doc.Gold),
                Bronze: Number(doc.Bronze)
            }));

            setTallyList(transformedTallies);
            setSuccess(true);
        } catch (error: any) {
            console.error("Error fetching tally:", error);
            setError("Failed to fetch tally");
        } finally {
            setIsLoaded(false);
        }
    };

    useEffect(() => {
        fetchTally();
    }, []);

    // Calculate totals
    const totals = tallyList.reduce(
        (acc, tally) => {
            acc.Silver += tally.Silver;
            acc.Gold += tally.Gold;
            acc.Bronze += tally.Bronze;
            return acc;
        },
        { Silver: 0, Gold: 0, Bronze: 0 }
    );

    return (
        <div className="p-8 bg-gray-100 ">
            {error && (
                <div className="mb-4 p-4 text-red-600 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}
            {success && !isLoaded && (
                  <div className="mt-12 max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-center">
                                    <Image src="/images/gold.svg" alt="Gold Medal" width={32} height={32} />
                                </th>
                                <th className="p-4 text-center">
                                    <Image src="/images/silver.svg" alt="Silver Medal" width={32} height={32} />
                                </th>
                                <th className="p-4 text-center">
                                    <Image src="/images/bronze.svg" alt="Bronze Medal" width={32} height={32} />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="p-4 text-center">
                                    {totals.Gold}
                                </td>
                                <td className="p-4 text-center">
                                    {totals.Silver}
                                </td>
                                <td className="p-4 text-center">
                                    {totals.Bronze}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
            {isLoaded && <div className="text-center">Loading...</div>}
        </div>
    );
}
