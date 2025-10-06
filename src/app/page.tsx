import { CharacterGenerator } from "@/components/CharacterGenerator";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading character generator...</span>
          </div>
        </div>
      }
    >
      <CharacterGenerator />
    </Suspense>
  );
}
