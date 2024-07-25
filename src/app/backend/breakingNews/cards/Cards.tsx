"use client";

import React, { useState, useEffect } from 'react';
import { Carousel, Card, Image } from 'antd';
import { useRouter } from 'next/navigation';
import client from '@/appwrite/config';
import { Databases, ID, Query } from 'appwrite';

const { Meta } = Card;

interface CardProps {
    Headline: string;
    NewsContents: string;
    Image: string;
    PublishedAt: Date;
    $id?: string; // Include the document ID
}

export default function Cards() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [cards, setCards] = useState<CardProps>({
        Headline: "",
        NewsContents: "",
        Image: "",
        PublishedAt: new Date()
    });

    const [newsList, setNewsList] = useState<CardProps[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const db = new Databases(client);
                const response = await db.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_BREAKING_NEWS_COLLECTION_ID!,
                    [Query.limit(1000)]
                );
                console.log("Fetched documents:", response.documents);
                const transformedNews: CardProps[] = response.documents.map((doc: any) => ({
                    $id: doc.$id,
                    Headline: doc.Headline,
                    NewsContents: doc.NewsContents,
                    Image: doc.Image,
                    PublishedAt: doc.PublishedAt
                }))

                setNewsList(transformedNews);
            } catch (error: any) {
                console.error("Fetch error:", error);
                setError("Error occurred while fetching news");
            }
        };

        fetchNews();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCards({
            ...cards,
            [event.target.name]: event.target.value
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setIsLoaded(true);
            const db = new Databases(client);
            await db.createDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_BREAKING_NEWS_COLLECTION_ID!,
                ID.unique(),
                cards
            );
            setSuccess(true);
            setCards({
                Headline: "",
                NewsContents: "",
                Image: "",
                PublishedAt: new Date()
            });
        } catch (error: any) {
            console.error("Submit error:", error);
            setError("Error occurred while saving card details");
        } finally {
            setIsLoaded(false);
        }
    };

    const headToFullNews = (newsID: string) => {
        router.push(`/fullNews/${newsID}`);
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
                    <h1>News details uploaded successfully!</h1>
                </div>
            )}

            <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upload Breaking News</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor='Headline' className="block text-sm font-medium text-gray-700">Headline</label>
                        <input
                            type="text"
                            placeholder="Headline"
                            name="Headline"
                            value={cards.Headline}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="NewsContents" className="block text-sm font-medium text-gray-700">News Contents</label>
                        <input
                            type="text"
                            placeholder="News Contents"
                            name="NewsContents"
                            value={cards.NewsContents}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="Image" className="block text-sm font-medium text-gray-700">Image</label>
                        <input
                            type="text"
                            placeholder="Image URL"
                            name="Image"
                            value={cards.Image}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <button type="reset" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-4">Reset</button>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    >
                        {isLoaded ? "Saving..." : "Upload"}
                    </button>
                </form>
            </div>
            <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg mt-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Breaking News</h1>
                <Carousel autoplay>
                    {newsList.map((news, index) => (
                        <div className="carousel-item" key={index}>
                            <Card
                                hoverable
                                cover={<Image alt="example" src={news.Image} />}
                                onClick={() => headToFullNews(news.$id!)} // Added onClick here
                            >
                                <Meta 
                                    title={news.Headline}
                                    description={news.NewsContents} 
                                />
                            </Card>
                        </div>
                    ))}
                </Carousel>
            </div>
        </div>
    );
}
