import React from "react";
import Link from "next/link";
export default function page() {
  return (
    <div>
      <nav className="flex justify-center w-full h-32 bg-gray-100">
        <ul className="mt-10">
          <li className="text-center text-xl flex gap-6">
            <Link
              className="w-48 h-10 flex items-center justify-center border border border-pink-500 rounded hover:bg-emerald-500 hover:border-none transition duration-300"
              href="/auth/login"
            >
              Portfolio Creator
            </Link>
            <Link
              className="w-48 h-10 flex items-center justify-center bg-gray-800 text-white rounded hover:bg-blue-600 transition duration-300"
              href="/review-portfolio"
            >
              Review Portfolio
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
