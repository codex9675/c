"use client"
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/master')
    } else if (status === 'authenticated' && session.user.role !== 'MASTER') {
      router.push('/auth/login?error=unauthorized')
    }
  }, [status, session, router])

  if (status !== 'authenticated' || session.user.role !== 'MASTER') {
    return <div>Loading...</div>
  }

  return (
    <div>
      <nav>
        <ul className="flex ml-5 mt-15 text-2xl justify-center ">
          <li className="mr-24 hover:text-red-500 transition-colors duration-300">
            <Link href="/master/watch-all-admin">Watch all user</Link>
          </li>
          <li className="mr-24 hover:text-red-500 transition-colors duration-300">
            <Link href="/master/create-admin">Create Admin</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
