'use client'
import React, {ChangeEvent, FormEvent, useState} from "react";

type SignUpData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

const SignUpPage = () => {
    const [formData, setFormData] = useState<SignUpData>({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState<string>("");

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
            const response = await fetch('https://frozen-eliminate-cheap-video.trycloudflare.com/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log("Sign up successful:", responseData);
                window.location.href = '/login';
            } else {
                setErrorMessage('Sign up failed. Please try again.');
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
                    Sign Up
                </h2>
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label className="mb-2 font-semibold">
                            First Name
                        </label>
                        <input id="firstName"
                               value={formData.firstName}
                               onChange={handleInputChange}
                               className="p-3 border rounded-md focus:outline-none focus:border-purple-500"
                               required/>
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-semibold">
                            Last Name
                        </label>
                        <input id="lastName"
                               value={formData.lastName}
                               onChange={handleInputChange}
                               className="p-3 border rounded-md focus:outline-none focus:border-purple-500"
                               required/>
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-semibold">
                            Email
                        </label>
                        <input id="email"
                               value={formData.email}
                               onChange={handleInputChange}
                               className="p-3 border rounded-md focus:outline-none focus:border-purple-500"
                               required pattern="[^@\s]+@[^@\s]+\.[^@\s]+"/>
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
                               required pattern=".{8,64}"
                               title="Password must be between 8 and 64 characters long" />
                    </div>
                    <button type="submit"
                            className="bg-purple-700 text-white px-4 py-2 rounded-md mt-4 hover:bg-purple-800">
                        Sign Up
                    </button>
                    {errorMessage && <div className="text-red-500 mt-2">{errorMessage}</div>}
                </form>
            </div>
        </div>
    );
};

export default SignUpPage;
