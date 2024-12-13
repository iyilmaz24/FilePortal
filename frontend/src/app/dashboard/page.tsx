'use client';
import React, { useState, useEffect } from "react";
import {useAuth} from "@/utils/AuthContext";

type SharedUser = {
    ID: number;
    Email: string;
};

type File = {
    ID: number;
    FileName: string;
    FileURL: string;
};

type SharedFile = {
    FileName: string;
    FileURL: string;
    ID: number;
    SharedWith: SharedUser[];
};

export default function Dashboard() {
    const [myFiles, setMyFiles] = useState<File[]>([]);
    const [sharedFiles, setSharedFiles] = useState<File[]>([]);
    const [mySharedFiles, setMySharedFiles] = useState<SharedFile[]>([]);
    const [activeTab, setActiveTab] = useState("myFiles");
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [selectedFileID, setSelectedFileID] = useState<number | null>(null);
    const [shareEmail, setShareEmail] = useState("");
    const { isLoggedIn } = useAuth();

    const fetchUserFiles = async () => {
        const token = localStorage.getItem("auth-token");
        if (!token) {
            return;
        }

        try {
            const response = await fetch("https://frozen-eliminate-cheap-video.trycloudflare.com/files", {
                method: "GET",
                headers: {
                    Authorization: `${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch files: ${errorText}`);
                return;
            }

            const files: File[] = await response.json();
            setMyFiles(files);

        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const file = event.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("auth-token");

        try {
            const response = await fetch("https://frozen-eliminate-cheap-video.trycloudflare.com/upload", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to upload file: ${errorText}`);
            }

            fetchUserFiles();
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleFileDelete = async (fileID: number) => {
        const token = localStorage.getItem("auth-token");

        try {
            const response = await fetch(`https://frozen-eliminate-cheap-video.trycloudflare.com/delete?id=${fileID}`, {
                method: "DELETE",
                headers: {
                    Authorization: `${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to delete file: ${errorText}`);
                return;
            }

            fetchUserFiles();
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    const fetchSharedFiles = async () => {
        const token = localStorage.getItem("auth-token");
        if (!token) return;

        try {
            const response = await fetch("https://frozen-eliminate-cheap-video.trycloudflare.com/shared-files", {
                method: "GET",
                headers: {
                    Authorization: `${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch shared files: ${errorText}`);
                return;
            }

            const files: File[] = await response.json();
            setSharedFiles(files);
        } catch (error) {
            console.error("Error fetching shared files:", error);
        }
    };

    const fetchMySharedFiles = async () => {
        const token = localStorage.getItem("auth-token");
        if (!token) return;

        try {
            const response = await fetch("https://frozen-eliminate-cheap-video.trycloudflare.com/my-shared-files", {
                method: "GET",
                headers: {
                    Authorization: `${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to fetch my shared files: ${errorText}`);
                return;
            }

            const files: {
                fileName: string;
                fileUrl: string;
                id: number;
                sharedWith: { id: number; email: string }[] | null;
            }[] = await response.json();

            const transformedFiles: SharedFile[] = files.map((file) => ({
                FileName: file.fileName,
                FileURL: file.fileUrl,
                ID: file.id,
                SharedWith: file.sharedWith
                    ? file.sharedWith.map((user) => ({
                        ID: user.id,
                        Email: user.email,
                    }))
                    : [],
            }));
            setMySharedFiles(transformedFiles);
        } catch (error) {
            console.error("Error fetching my shared files:", error);
        }
    };

    const handleFileShare = async () => {
        const token = localStorage.getItem("auth-token");
        if (!token || !selectedFileID || !shareEmail) return;

        try {
            const response = await fetch(
                `https://frozen-eliminate-cheap-video.trycloudflare.com/share?file_id=${selectedFileID}&target_email=${shareEmail}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to share file: ${errorText}`);
                return;
            }

            setShowSharePopup(false);
            setShareEmail("");
            fetchMySharedFiles();
        } catch (error) {
            console.error("Error sharing file:", error);
        }
    };

    const handleFileUnshare = async (fileID: number, targetUserID: number) => {
        const token = localStorage.getItem("auth-token");

        try {
            const response = await fetch(
                `https://frozen-eliminate-cheap-video.trycloudflare.com/unshare?file_id=${fileID}&target_user_id=${targetUserID}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Failed to unshare file: ${errorText}`);
                return;
            }

            fetchMySharedFiles();
        } catch (error) {
            console.error("Error unsharing file:", error);
        }
    };

    useEffect(() => {
        fetchUserFiles();
        fetchSharedFiles();
        fetchMySharedFiles();
    }, []);

    if (isLoggedIn === null) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
        return null;
    }

    return (
        <div className="dark-purple-bg flex flex-col items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-lg w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-center mb-6">Dashboard</h1>
                <div className="flex gap-4 justify-center mb-6">
                    <button
                        className={`px-4 py-2 rounded-md ${activeTab === "myFiles" ? "bg-purple-700 text-white" : "bg-gray-300"}`}
                        onClick={() => setActiveTab("myFiles")}
                    >
                        My Files
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${activeTab === "sharedFiles" ? "bg-purple-700 text-white" : "bg-gray-300"}`}
                        onClick={() => setActiveTab("sharedFiles")}
                    >
                        Shared with Me
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${activeTab === "mySharedFiles" ? "bg-purple-700 text-white" : "bg-gray-300"}`}
                        onClick={() => setActiveTab("mySharedFiles")}
                    >
                        My Shared Files
                    </button>
                </div>

                {activeTab === "myFiles" && (
                    <>
                        <button
                            className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 mb-6"
                            onClick={() => document.getElementById("fileInput")?.click()}
                        >
                            Upload a File
                        </button>
                        <input
                            id="fileInput"
                            type="file"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                        <div className="flex flex-col gap-4">
                            {myFiles && myFiles.length > 0 ? (
                                <ul className="list-none">
                                    {myFiles.map((file: { ID: number; FileName: string; FileURL: string }, index) => (
                                        <li
                                            key={index}
                                            className="flex justify-between items-center border-b p-3 text-gray-700"
                                        >
                                            <p>{file.FileName}</p>
                                            <div className="flex gap-4">
                                                <button
                                                    className="text-purple-700 hover:underline"
                                                    onClick={() => window.open(file.FileURL, "_blank")}
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    className="text-red-700 hover:underline"
                                                    onClick={() => handleFileDelete(file.ID)}
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    className="text-blue-700 hover:underline"
                                                    onClick={() => {
                                                        setSelectedFileID(file.ID);
                                                        setShowSharePopup(true);
                                                    }}
                                                >
                                                    Share
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center">No files available.</p>
                            )}
                        </div>
                    </>
                )}

                {activeTab === "sharedFiles" && (
                    <div className="flex flex-col gap-4">
                        {sharedFiles && sharedFiles.length > 0 ? (
                            <ul className="list-none">
                                {sharedFiles.map((file: { FileName: string; FileURL: string }, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center border-b p-3 text-gray-700"
                                    >
                                        <p>{file.FileName}</p>
                                        <button
                                            className="text-purple-700 hover:underline"
                                            onClick={() => window.open(file.FileURL, "_blank")}
                                        >
                                            Download
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center">No files shared with you.</p>
                        )}
                    </div>
                )}

                {activeTab === "mySharedFiles" && (
                    <div className="flex flex-col gap-4">
                        {mySharedFiles && mySharedFiles.length > 0 ? (
                            <ul className="list-none">
                                {mySharedFiles.map(
                                    (
                                        file: {
                                            FileName: string;
                                            FileURL: string;
                                            ID: number;
                                            SharedWith?: { ID: number; Email: string }[];
                                        },
                                        index
                                    ) => (
                                        <li
                                            key={index}
                                            className="flex flex-col border-b p-3 text-gray-700"
                                        >
                                            <p className="font-bold">{file.FileName}</p>
                                            <ul className="list-none">
                                                {(file.SharedWith || []).map((sharedUser) => (
                                                    <li
                                                        key={sharedUser.ID}
                                                        className="flex justify-between items-center mt-2"
                                                    >
                                                        <span>{sharedUser.Email}</span>
                                                        <button
                                                            className="text-red-700 hover:underline"
                                                            onClick={() =>
                                                                handleFileUnshare(file.ID, sharedUser.ID)
                                                            }
                                                        >
                                                            Unshare
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-center">No files shared with others.</p>
                        )}
                    </div>
                )}
            </div>

            {/* share file popup */}
            {showSharePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Share File</h2>
                        <input
                            type="email"
                            className="border border-gray-300 p-2 w-full mb-4"
                            placeholder="Enter email address"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                                onClick={() => {
                                    setShowSharePopup(false);
                                    setShareEmail("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800"
                                onClick={handleFileShare}
                            >
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
