import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "@/lib/firebaseConfig";
import { collection, query, orderBy, startAt, endAt, getDocs, limit } from "firebase/firestore";
import UserSearchProfile from "@/components/(search)/UserSearchProfile";
import { Loader2, UserX } from 'lucide-react';

const BATCH_SIZE = 20;

export default function Search() {
    const router = useRouter();
    const { query: searchQuery } = router.query;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState(null);

    useEffect(() => {
        if (!searchQuery) {
            setUsers([]);
            setLoading(false);
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const usersRef = collection(db, "users");

                const firestoreQuery = query(
                    usersRef,
                    orderBy("name"),
                    startAt(searchQuery),
                    endAt(searchQuery + "\uf8ff"),
                    limit(BATCH_SIZE)
                );

                const querySnapshot = await getDocs(firestoreQuery);

                const fetchedUsers = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setUsers(fetchedUsers);
                setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [searchQuery]);

    return (
        <div className="max-w-7xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Search Results</h1>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-[#1DB954]" />
                </div>
            ) : users.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {users.map((user) => (
                        <UserSearchProfile key={user.id} user={user} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64">
                    <UserX className="w-16 h-16 mb-4 text-zinc-600" />
                    <p className="text-xl text-zinc-400">No users found</p>
                    <p className="mt-2 text-zinc-500">Try adjusting your search terms</p>
                </div>
            )}
        </div>
    );
}