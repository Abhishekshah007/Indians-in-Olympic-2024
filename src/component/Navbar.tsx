"use client";

import Image from "next/image";

export default function Navbar() {
    return <>
    <nav>
  <div
    className="logo"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "20px",
      gap: "10px", // Add gap between text and image if needed
    }}
  >
    <span className="text-3xl font-bold text-white">
      Team{" "}
      <span
        className="bg-gradient-to-r from-saffron-500 via-white to-green-500 text-transparent bg-clip-text"
        style={{
          backgroundImage:
            "linear-gradient(to right, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%)",
        }}
      >
        India
      </span>{" "}
      in
    </span>
    <Image src="/images/logo.png" alt="logo" width={200} height={200} priority />
  </div>
</nav>

    </>

}