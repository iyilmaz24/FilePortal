'use client'
import React, { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/utils/AuthContext";

type LoginData = {
    email: string;
    password: string;
};

const LoginPage = () => {
    const [formData, setFormData] = useState<LoginData>({
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState<string>("");
    const { login } = useAuth();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('https://frozen-eliminate-cheap-video.trycloudflare.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const responseData = await response.json();
                login(responseData.token);
            } else {
                setErrorMessage('Login failed. Please check your credentials and try again.');
            }
        } catch (error) {
            setErrorMessage('An unexpected error occurred. Please try again later.');
            console.error(error);
        }
    };

    return(
        <div className="dark-purple-bg flex flex-col justify-center items-center min-h-screen">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">
                    Login
                </h2>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label className="mb-2 font-semibold">
                            Email
                        </label>
                        <input id="email"
                               value={formData.email}
                               onChange={handleInputChange}
                               className="p-3 border rounded-md focus:outline-none focus:border-purple-500"
                               required pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                               title="Invalid email address" />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-semibold">
                            Password
                        </label>
                        <input id="password"
                               type="password"
                               value={formData.password}
                               onChange={handleInputChange}
                               className="p-3 border rounded-md focus:outline-none focus:border-purple-500"
                               required/>
                    </div>
                    <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded-md mt-4 hover:bg-purple-800">
                        Login
                    </button>
                    {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
                    <div className="flex justify-between mt-4">
                        <Link href={"/login/signup"}>
                            <button type="button" className="text-purple-700 hover:underline">Sign Up</button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
