import LimboContainer from "@/app/_components/limbo/LimboContainer";

export default function Dice() {
  return (
    <main className="flex flex-col h-full">
      <div className="flex flex-col lg:flex-row w-full p-4 lg:p-8 flex-1">
        <div className="flex justify-center items-center w-full p-4">
          <LimboContainer />
        </div>
      </div>
    </main>
  );
}
