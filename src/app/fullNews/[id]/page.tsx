"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'
import client from '@/appwrite/config';
import { Databases } from 'appwrite';
import { Image, Spin} from 'antd';
import Navbar from '@/component/Navbar';

interface CardProps {
    Headline: string;
    NewsContents: string;
    Image: string;
    PublishedAt: Date;
}

export default function FullNews() {
    const pathname = usePathname();
    const id = pathname?.split('/').pop();

    const [news, setNews] = useState<CardProps | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            if (id) {
                try {
                    const db = new Databases(client);
                    const response = await db.getDocument(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        process.env.NEXT_PUBLIC_APPWRITE_BREAKING_NEWS_COLLECTION_ID!,
                        id as string
                    );
                    setNews(response as unknown as CardProps);
                } catch (error: any) {
                    console.error(error);
                }
            }
        };

        fetchNews();
    }, [id]);

    if (!news) {
        return <div className="p-8 bg-gray-100 min-h-screen"><Spin/></div>;
    }

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <Navbar/>
            <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg my-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{news.Headline}</h1>
                <Image alt={news.Headline} src={news.Image} className="mb-8" />
                <p className="text-gray-700">{news.NewsContents}</p>
                <p className="text-gray-500 text-sm mt-4">Published on: {new Date(news.PublishedAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
}