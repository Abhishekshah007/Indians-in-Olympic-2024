import "./globals.css";
import Navbar from "@/component/Navbar";
import NoOfPlayers from "@/component/NoOfPlayers";
import NoOfDiscipline from "@/component/NoOfDiscipline";
import MedalTally from "@/component/MedalTally";
import Blogs from "@/component/Blogs";
import Schedule from "@/component/Schedule";
import Footer from "@/component/Footer";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-black p-6 overflow-hidden">
      <Navbar />
      <div className="flex flex-wrap gap-6 justify-center max-w-6xl w-full mt-4">
        <div className="flex-1 min-w-[250px] bg-white p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-2xl">
          <NoOfPlayers />
        </div>
        <div className="flex-1 min-w-[250px] bg-white p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-2xl">
          <NoOfDiscipline />
        </div>
        <div className="flex-1 min-w-[250px] bg-white p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-2xl">
          <MedalTally />
        </div>
      </div>
      <div className="w-full mt-8">
        <Blogs />
      </div>
      <div className="w-full mt-8">
        <Schedule/>
      </div>
      <Footer/>
    </main>
  );
}
