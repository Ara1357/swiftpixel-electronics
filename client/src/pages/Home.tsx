import { useState, useEffect } from "react";

type Product = { id: string; name: string; price: number; stock: number; status: "Active" | "Out of Stock"; img: string };
const ORANGE = "#f68b1e";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "ESP32 WiFi Dev Board Type-C", price: 8500, stock: 45, status: "Active", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200" },
    { id: "2", name: "Arduino Uno R3", price: 12000, stock: 0, status: "Out of Stock", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Product|null>(null);
  const [form, setForm] = useState({ name: "", price: "", stock: "", img: "" });
  const [toast, setToast] = useState("");

  useEffect(()=>{ const s=localStorage.getItem("jumia-pro"); if(s) setProducts(JSON.parse(s)) },[]);
  useEffect(()=>{ localStorage.setItem("jumia-pro", JSON.stringify(products)) },[products]);

  const notify = (m:string)=>{ setToast(m); setTimeout(()=>setToast(""), 2500) };

  const handleImage = (e: any, target: "form" | "edit") => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if(target==="form") setForm({...form, img: reader.result as string});
      else if(editing) setEditing({...editing, img: reader.result as string});
    };
    reader.readAsDataURL(file);
  };

  const add = () => {
    if(!form.name ||!form.price) return notify("Enter name & price");
    setProducts([{ id: Date.now().toString(), name: form.name, price: Number(form.price), stock: Number(form.stock)||0, status: Number(form.stock)>0? "Active":"Out of Stock", img: form.img || "https://images.unsplash.com/photo-1525598912003-663126343e1f?w=200" },...products]);
    setForm({name:"",price:"",stock:"",img:""}); setShowAdd(false); notify("✅ Product Added!");
  };

  const saveEdit = () => {
    if(!editing) return;
    setProducts(p=>p.map(x=> x.id===editing.id? {...editing, status: editing.stock>0? "Active":"Out of Stock"} : x));
    setEditing(null); notify("✅ Product Updated!");
  };

  const del = (id:string) => { setProducts(p=>p.filter(x=>x.id!==id)); notify("🗑️ Deleted") };

  return (
    <div className="min-h-screen bg-[#f1f1f2]">
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2.5 rounded-lg z-50 text-sm font-bold">{toast}</div>}

      <div style={{background:ORANGE}} className="text-white px-4 py-3 flex justify-between items-center sticky top-0 z-20">
        <span className="font-black text-xl">JUMIA ★ <span className="bg-black/20 text-[11px] px-2 py-1 rounded ml-2">SELLER CENTER PRO</span></span>
        <span className="bg-white text-black px-3 py-1 rounded text-xs font-bold">{products.length} Products</span>
      </div>

      <div className="max-w-[1300px] mx-auto p-3">
        <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center mb-3">
          <h2 className="font-bold">My Products</h2>
          <button onClick={()=>setShowAdd(true)} style={{background:ORANGE}} className="text-white px-5 py-2.5 rounded font-bold text-sm">+ ADD PRODUCT</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="hidden md:grid grid-cols-12 bg-gray-50 p-3 text-[11px] text-gray-500 font-bold">
            <div className="col-span-5">PRODUCT</div><div className="col-span-2">PRICE</div><div className="col-span-2">STOCK</div><div className="col-span-3">ACTION</div>
          </div>
          {products.map(p=>(
            <div key={p.id} className="grid grid-cols-12 p-3 border-t items-center hover:bg-gray-50">
              <div className="col-span-12 md:col-span-5 flex gap-3">
                <img src={p.img} className="w-14 h-14 rounded object-cover bg-gray-100"/>
                <div><p className="font-medium text-[13px]">{p.name}</p><span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status==="Active"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>{p.status}</span></div>
              </div>
              <div className="col-span-4 md:col-span-2 mt-2 md:mt-0"><p className="font-bold text-sm">₦{p.price.toLocaleString()}</p></div>
              <div className="col-span-4 md:col-span-2 text-sm">{p.stock}</div>
              <div className="col-span-4 md:col-span-3 flex gap-2">
                <button onClick={()=>{ setEditing(p); setForm({name:"",price:"",stock:"",img:""}) }} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-600 hover:text-white">EDIT</button>
                <button onClick={()=>del(p.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-
