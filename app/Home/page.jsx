"use client";
import React from "react";
import Link from "next/link";
import Nav from "./Nav/page";
import Image from "next/image";
import Typewriter from "typewriter-effect";
import style from "../css/style.module.css";
import Head from "next/head";
export default function page() {
  return (
    <div>

      <Nav />
      <div className="ml-20 mt-25 text-4xl font-bold">
        <div className={`relative top-60 ${style.AutoH}`}>
          <div className={`text-7xl max-w-220 ${style.autoType}`}>
            <Typewriter
              options={{
                strings: [
                  "We are make best Portfolio",
                  ' <span style="color: #dc2626;"> A strong portfolio opens doors and starts conversations </span>',
                ],
                autoStart: true,
                loop: true,
              }}
            />
          </div>
          <h4 className="text-[15px] mb-10 mt-7 w-112 text-[rgba(43,43,43)] ">
            every product in your portfolio is a chapter ensure every chapter
            effectivly tells your story
          </h4>
          <Link
            className="bg-gray-900 text-white text-xl w-40 h-10 pl-5 pt-1 rounded-2xl hover:bg-transparent hover:border-b-red-600 hover:border hover:text-black flex transtition duration-300 ease-in-out"
            href="https://www.instagram.com/gukluk2025/"
          >
            Create Now
          </Link>
          <div
            className={`text-center text-white pt-30 justify-center ml-auto mr-auto mt-80 mb-90 h-100 rounded-2xl bg-[rgba(0,80,157)] max-w-7xl ${style.info}`}
          >
            <h1>What is Gukluk</h1>
            <p className="text-[18px] max-w-5xl ml-auto mr-auto font-normal mt-3 leading-[25px]">
              Welcome to Gukluk, the hub of creativity and professionalism. Our
              platform empowers you to easily create stunning portfolios and
              share them with the world. Whether you're a freelancer, artist, or
              business professional, Gukluk helps you showcase your talent and
              connect with new opportunities. Join the Gukluk community today
              and unleash your full potential!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
