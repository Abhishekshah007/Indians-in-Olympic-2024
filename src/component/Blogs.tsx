"use client";

import { useState, useEffect } from "react";
import client from "@/appwrite/config";
import { Databases, Query } from 'appwrite';
import { Carousel, Card, Image, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import moment from 'moment';

interface FetchResponse {
    $id: string;
    Headline: string;
    NewsContents: string;
    Image: string;
    PublishedAt: string;
}

const { Meta } = Card;

export default function Blogs() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [blogs, setBlogs] = useState<FetchResponse[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setIsLoaded(true);
                const db = new Databases(client);
                const response = await db.listDocuments(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_BREAKING_NEWS_COLLECTION_ID!,
                    [Query.limit(1000)]
                );

                const transformedNews: FetchResponse[] = response.documents.map((doc: any) => ({
                    $id: doc.$id,
                    Headline: doc.Headline,
                    NewsContents: doc.NewsContents,
                    Image: doc.Image,
                    PublishedAt: doc.PublishedAt
                }));

                // Sort blogs by PublishedAt date in descending order (newest first)
                const sortedNews = transformedNews.sort((a, b) => new Date(b.PublishedAt).getTime() - new Date(a.PublishedAt).getTime());

                setBlogs(sortedNews);
                setSuccess(true);
            } catch (error: any) {
                setError("Error occurred while fetching news");
            } finally {
                setIsLoaded(false);
            }
        };

        fetchNews();
    }, []);

    const headToFullNews = (newsID: string) => {
        router.push(`/fullNews/${newsID}`);
    };

    return (
        <div className="max-w-4xl mx-auto bg-black p-8 shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold text-white mb-8">Breaking News</h1>
            {isLoaded ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <Carousel autoplay>
                    {blogs.map((news, index) => (
                        <div className="carousel-item" key={index}>
                            <Card
                                hoverable
                                cover={<Image alt="example" src={news.Image} className="max-w-full" />}
                                onClick={() => headToFullNews(news.$id)}
                            >
                                <Meta 
                                    title={news.Headline} 
                                    description={moment(news.PublishedAt).format('MMMM Do YYYY, h:mm:ss a')}
                                />
                            </Card>
                        </div>
                    ))}
                </Carousel>
            )}
        </div>
    );
}
