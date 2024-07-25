"use client";
import { useEffect, useMemo, useState } from "react";
import client from '@/appwrite/config';
import { Account } from 'appwrite';
import { useRouter } from "next/navigation";

export default function Page() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const account =useMemo(() => new Account(client), []);
    const router = useRouter();

    useEffect( () => {
        const user =  account.get();
        user.then((user) => {
            if(user) {
                router.push("/backend/dashboard");
            }
        })
        


    },[account, router]);



    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await account.createEmailPasswordSession(email, password);
            setSuccess(true);
            router.push("/backend/dashboard");
        } catch (error: any) {
            console.error("Error logging in:", error);
            setError(error.message || "Failed to login");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-black">
            {error && (
                <div className="mb-4 p-4 text-red-600 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 text-green-600 bg-green-100 rounded-lg">
                    Logged in successfully
                </div>
            )}
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <form className="flex flex-col" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="text"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Login
                        </button>
                    </div>
                    {error && <p className="text-red-500 mt-4">{error}</p>}
                </form>
            </div>
        </div>
    );
}
