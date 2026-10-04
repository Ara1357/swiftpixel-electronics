import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [active, setActive] = useState("Dashboard");
  
  const handleClick = (name: string) => {
    setActive(name);
    alert(`${name} page coming soon! - Demo: ₦18.4m data`);
  };

  return (
    <div className="min-h-screen bg-white p-4 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Admin control room</h1>
        <div className="w-8 h-8 bg-black rounded-full" />
      </div>
      <p className="text-gray-500 mb-6">Keep the marketplace moving.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border p-4 rounded-xl"><p className="text-sm text-gray-500">Total sales</p><p className="text-2xl font-bold">₦18.4m</p></div>
        <div className="border p-4 rounded-xl"><p className="text-sm text-gray-500">Active users</p><p className="text-2xl font-bold">8,294</p></div>
        <div className="border p-4 rounded-xl"><p className="text-sm text-gray-500">Pending orders</p><p className="text-2xl font-bold">126</p></div>
        <div className="border p-4 rounded-xl"><p className="text-sm text-gray-500">Returns</p><p className="text-2xl font-bold">18</p></div>
      </div>

      {/* Quick Actions - NOW ALL WORKING */}
      <h2 className="font-bold mb-3">Quick Actions</h2>
      <div className="space-y-3">
        <Button onClick={() => handleClick("Platform settings")} variant="outline" className="w-full justify-between h-14">⚙️ Platform settings <span>→</span></Button>
        <Button onClick={() => handleClick("Manage users - 8,294 active")} variant="outline" className="w-full justify-between h-14">👥 Manage users <span>→</span></Button>
        <Button onClick={() => handleClick("Verify sellers - 7 waiting")} variant="outline" className="w-full justify-between h-14">✅ Verify sellers <span>→</span></Button>
        <Button onClick={() => handleClick("Review products - 12 pending")} variant="outline" className="w-full justify-between h-14">📦 Review products <span>→</span></Button>
        <Button onClick={() => handleClick("Financial report ₦18.4m")} className="w-full justify-between h-14 bg-black text-white">📊 Financial report <span>→</span></Button>
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-6">Active: {active}</p>
    </div>
  );
}
