import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import useInjectMethods from "@/hooks/useInjectMethods";
import GameRenderer from "@/components/GameRenderer";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const injected = useInjectMethods();

  return (
    <>
      <main className={`${styles.main} ${inter.className}`}>
        <GameRenderer></GameRenderer>
      </main>
    </>
  );
}
