"use client";
import { Button, Modal, Pagination, Table, Image } from "antd";
import { useEffect, useState } from "react";
import client from "@/appwrite/config";
import { Databases, Query } from 'appwrite';

interface fetchPlayers {
    $id: string;
    Name: string;
    Image: string;
    IsOut: boolean;
    Discipline: string;
    MedalType: string;
}

export default function NoOfPlayers() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [athleteList, setAthleteList] = useState<fetchPlayers[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSortedByOut, setIsSortedByOut] = useState(false);
    const perPage = 25;

    const fetchAthletes = async (page: number) => {
        try {
            setIsLoaded(true);
            const db = new Databases(client);
            const response = await db.listDocuments(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_ATHELETES_COLLECTION_ID!,
                [Query.limit(1000)]
            );

            const transformedAthletes: fetchPlayers[] = response.documents.map((doc: any) => ({
                $id: doc.$id,
                Name: doc.Name,
                Image: doc.Image,
                Discipline: doc.Discipline,
                IsOut: doc.IsOut,
                MedalType: doc.MedalType
            }));

            setAthleteList(transformedAthletes);
            setSuccess(true);
        } catch (error: any) {
            console.error("Error fetching athletes:", error);
            setError("Failed to fetch athletes");
        } finally {
            setIsLoaded(false);
        }
    };

    useEffect(() => {
        fetchAthletes(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const sortByIsOut = () => {
        const sortedList = [...athleteList].sort((a, b) => {
            if (a.IsOut === b.IsOut) return 0;
            return a.IsOut ? -1 : 1;
        });
        setAthleteList(sortedList);
        setIsSortedByOut(true);
    };

    const indexOfLastBlog = currentPage * perPage;
    const indexOfFirstBlog = indexOfLastBlog - perPage;
    const currentBlogs = athleteList.slice(indexOfFirstBlog, indexOfLastBlog);

    return (
        <>
            <div className="cursor-pointer" onClick={showModal}>
                <h1 className="text-xl font-bold text-center">Number of Players</h1>
                <h1 className="text-xl font-bold text-center">{athleteList.length}</h1>
                <Image src="/images/athletes.png" alt="Discipline" width="auto" height="auto" preview={false} />
                <p className="text-center">Click to see details</p>
            </div>

            <Modal title="Player Details" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width="80vw">
                {error && <div className="text-red-600 mb-4">{error}</div>}
                {success && !isLoaded && (
                    <>
                        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Athlete Details</h1>
                        <Button onClick={sortByIsOut}>Sort by Is Out</Button>
                        <div className="w-full overflow-auto">
                            <Table dataSource={currentBlogs} rowKey="$id" pagination={false} scroll={{ x: 800 }}>
                                <Table.Column title="Name" dataIndex="Name" key="Name" width={150} />
                                <Table.Column
                                    title="Image"
                                    dataIndex="Image"
                                    key="Image"
                                    width={100}
                                    render={(text, record: fetchPlayers) => (
                                        <Image src={record.Image} alt={record.Name} className="w-16 h-16 rounded-full" width={64} height={64} />
                                    )}
                                />
                                <Table.Column title="Discipline" dataIndex="Discipline" key="Discipline" width={150} />
                                <Table.Column title="Is Out" dataIndex="IsOut" key="IsOut" width={100} render={(text, record: fetchPlayers) => (record.IsOut ? "Yes" : "No")} />
                                <Table.Column title="Medal Type" dataIndex="MedalType" key="MedalType" width={150} />
                                <Table.Column
                                    title="Edit"
                                    key="edit"
                                    width={100}
                                    render={(text, record: fetchPlayers) => (
                                        <button className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
                                    )}
                                />
                            </Table>
                        </div>
                        <div className="mt-4">
                            <Pagination
                                current={currentPage}
                                pageSize={perPage}
                                total={athleteList.length}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    </>
                )}
                {isLoaded && <div>Loading...</div>}
            </Modal>
        </>
    );
}
