import { useState, useEffect } from "react";

type Product = { id: string; name: string; price: number; stock: number; img: string };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([
    { id: "1", name: "ESP32 Dev Board", price: 8500, stock: 45, img: "🔌" },
    { id: "2", name: "Arduino Uno R3", price: 12000, stock: 0, img: "🛠️" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [edit, setEdit] = useState<Product|null>(null);
  const [f, setF] = useState({ name: "", price: "", stock: "", img: "📦" });
  const [toast, setToast] = useState("");

  useEffect(()=>{ const s=localStorage.getItem("jumia-final"); if(s) setProducts(JSON.parse(s)) },[]);
  useEffect(()=>{ localStorage.setItem("jumia-final", JSON.stringify(products)) },[products]);

  const pop = (m:string)=>{ setToast(m); setTimeout(()=>setToast(""),2000) };

  const onFile = (e:any, mode:string) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const r = new FileReader();
    r.onload = () => {
      const base64 = r.result as string;
      if(mode==="add") setF({...f, img: base64});
      if(mode==="edit" && edit) setEdit({...edit, img: base64});
    };
    r.readAsDataURL(file);
  };

  const add = () => {
    if(!f.name ||!f.price) return pop("Enter name & price");
    setProducts([{id:Date.now().toString(), name:f.name, price:Number(f.price), stock:Number(f.stock)||0, img:f.img},...products]);
    setF({name:"",price:"",stock:"",img:"📦"}); setShowAdd(false); pop("✅ Added!");
  };

  const save = () => {
    if(!edit) return;
    setProducts(p=>p.map(x=>x.id===edit.id?edit:x));
    setEdit(null); pop("✅ Updated!");
  };

  return (
    <div className="min-h-screen bg-[#f1f1f2]">
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2 rounded-lg z-50 text-sm font-bold">{toast}</div>}

      <div style={{background:"#f68b1e"}} className="text-white px-4 py-3 flex justify-between items-center">
        <b className="text-xl">JUMIA ★ SELLER</b>
        <span className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">{products.length} items</span>
      </div>

      <div className="max-w-5xl mx-auto p-3">
        <div className="bg-white rounded-lg p-4 flex justify-between items-center mb-3 shadow-sm">
          <b>My Products</b>
          <button onClick={()=>setShowAdd(true)} style={{background:"#f68b1e"}} className="text-white px-4 py-2 rounded font-bold text-sm">+ ADD</button>
        </div>

        <div className="bg-white rounded-lg shadow-sm divide-y">
          {products.map(p=>(
            <div key={p.id} className="p-3 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl overflow-hidden">
                {p.img.startsWith("data:")? <img src={p.img} className="w-full h-full object-cover"/> : p.img}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{p.name}</p>
                <p className="text-sm">₦{p.price.toLocaleString()} • {p.stock} qty</p>
              </div>
              <button onClick={()=>setEdit(p)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-xs font-bold">EDIT</button>
              <button onClick={()=>{ setProducts(products.filter(x=>x.id!==p.id)); pop("Deleted") }} className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs font-bold">DEL</button>
            </div>
          ))}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-3 z-30">
          <div className="bg-white w-full max-w-md rounded-xl p-5">
            <h3 className="font-bold mb-3">Add Product</h3>
            <input type="file" accept="image/*" onChange={e=>onFile(e,"add")} className="w-full border border-dashed rounded-lg p-2 mb-3 text-sm"/>
            <input value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder="Name" className="w-full border rounded-lg px-3 py-2.5 mb-2 text-sm"/>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input type="number" value={f.price} onChange={e=>setF({...f,price:e.target.value})} placeholder="Price" className="border rounded-lg px-3 py-2.5 text-sm"/>
              <input type="number" value={f.stock} onChange={e=>setF({...f,stock:e.target.value})} placeholder="Stock" className="border rounded-lg px-3 py-2.5 text-sm"/>
            </div>
            <button onClick={add} style={{background:"#f68b1e"}} className="w-full text-white py-3 rounded-lg font-bold">ADD NOW</button>
            <button onClick={()=>setShowAdd(false)} className="w-full mt-2 bg-gray-100 py-2.5 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-3 z-30">
          <div className="bg-white w-full max-w-md rounded-xl p-5">
            <h3 className="font-bold mb-3">Edit Product</h3>
            <input type="file" accept="image/*" onChange={e=>onFile(e,"edit")} className="w-full border border-dashed rounded-lg p-2 mb-3 text-sm"/>
            <div className="w-16 h-16 bg-gray-100 rounded mb-3 overflow-hidden flex items-center justify-center text-2xl">
              {edit.img.startsWith("data:")? <img src={edit.img} className="w-full h-full object-cover"/> : edit.img}
            </div>
            <input value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})} className="w-full border rounded-lg px-3 py-2.5 mb-2 text-sm"/>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input type="number" value={edit.price} onChange={e=>setEdit({...edit,price:Number(e.target.value)})} className="border rounded-lg px-3 py-2.5 text-sm"/>
              <input type="number" value={edit.stock} onChange={e=>setEdit({...edit,stock:Number(e.target.value)})} className="border rounded-lg px-3 py-2.5 text-sm"/>
            </div>
            <button onClick={save} style={{background:"#f68b1e"}} className="w-full text-white py-3 rounded-lg font-bold">SAVE</button>
            <button onClick={()=>setEdit(null)} className="w-full mt-2 bg-gray-100 py-2.5 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
