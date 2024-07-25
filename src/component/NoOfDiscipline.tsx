"use client";
import { Table, Modal, Image } from "antd";
import { useEffect, useState } from "react";
import client from "@/appwrite/config";
import { Databases, Query } from 'appwrite';

interface fetchDisciplines {
    $id: string;
    Discipline: string;
}

export default function NoOfDiscipline() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [disciplineList, setDisciplineList] = useState<fetchDisciplines[]>([]);
    const [disciplineCounts, setDisciplineCounts] = useState<{ [key: string]: number }>({});

    const fetchDisciplines = async () => {
        try {
            setIsLoaded(true);
            const db = new Databases(client);
            const response = await db.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_ATHELETES_COLLECTION_ID!,
                [Query.limit(1000)]
            );

            const transformedDisciplines: fetchDisciplines[] = response.documents.map((doc: any) => ({
                $id: doc.$id,
                Discipline: doc.Discipline
            }));

            setDisciplineList(transformedDisciplines);
            setIsLoaded(false);
        } catch (error: any) {
            console.error("Error fetching disciplines:", error);
            setError("Failed to fetch disciplines");
            setIsLoaded(false);
        }
    };

    useEffect(() => {
        fetchDisciplines();
    }, []);

    const showModal = () => {
        setIsModalOpen(true);
        sortData();
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const sortData = () => {
        const count: { [key: string]: number } = {};

        for (let i = 0; i < disciplineList.length; i++) {
            const discipline = disciplineList[i].Discipline;
            if (!count[discipline]) {
                count[discipline] = 0;
            }
            count[discipline]++;
        }

        setDisciplineCounts(count);
    };

    const dataSource = Object.keys(disciplineCounts).map(key => ({
        Discipline: key,
        Count: disciplineCounts[key]
    }));

    return (
        <>
            <div className="cursor-pointer" onClick={showModal}>
                <h1 className="text-xl font-bold text-center">Number of Disciplines</h1>
                <h1 className="text-xl font-bold text-center">16</h1>
                <Image className="mt-4" src="/images/discipline.png" alt="Discipline" width="auto" height="auto" preview={false} />
                <p className="text-center">Click to see details</p>
            </div>

            <Modal title="Discipline Details" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width="80vw">
                {error && <div className="text-red-600 mb-4">{error}</div>}
                {!isLoaded && (
                    <>
                        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Discipline Details</h1>
                        <Table dataSource={dataSource} rowKey="Discipline" pagination={false}>
                            <Table.Column title="Discipline" dataIndex="Discipline" key="Discipline" />
                            <Table.Column title="Count" dataIndex="Count" key="Count" />
                        </Table>
                    </>
                )}
                {isLoaded && <div>Loading...</div>}
            </Modal>
        </>
    );
}
