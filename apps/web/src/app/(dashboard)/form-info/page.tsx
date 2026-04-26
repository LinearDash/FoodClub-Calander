"use client";
import React, { useState } from "react";

function CopyableField({ label, value, multiline = false }: { label: string, value: string, multiline?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl hover:bg-surface-container-low transition-colors group border border-transparent hover:border-outline-variant/30 relative">
      <span className="text-xs font-semibold uppercase text-on-surface-variant tracking-wider">{label}</span>
      {multiline ? (
        <p className="text-sm text-on-surface font-medium whitespace-pre-wrap">{value}</p>
      ) : (
        <p className="text-base text-on-surface font-medium truncate pr-8">{value}</p>
      )}
      <button 
        onClick={handleCopy}
        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-surface-container-high text-on-surface-variant opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white'}`}
        aria-label="Copy"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        )}
      </button>
    </div>
  );
}

export default function FormInfoPage() {
  const [menuCopied, setMenuCopied] = useState(false);

  const handleCopyMenu = () => {
    const fullMenu = `Main Dishes:
- Honey Soy Waffle Chicken ($20): Buckwheat waffle, maple mayo, Asian slaw, chips. Contains: Dairy, Egg.
- Manchurian Pork belly Loaded Fries ($22): Sizzling pork, crispy, sepen sauce, pickle vegetables.
- Lhasa Loaded chicken ($20): Panko crumbed chicken, Sichuan mayo, summer slaw, cheese, chips. Contains: Dairy, Egg.
- Delight Chicken Manchurian ($18 - GF): Crispy chicken, jasmine rice, Manchurian sauce.
- Signature Pork and rice bowl ($23 - GF): Chilli and lime glazed pork belly, sticky rice, boiled egg, sepen sauce, sesame slaw.
- Pork on the bun ($18): BBQ pork, Hoisin Mayo, apple slaw, bun. Contains: Dairy, Egg.
- Vegetable Manchurian ($18 - V): Seasonal vegetable, Jasmine Rice, Manchurian sauce.
- Lime and Lemongrass squid ($23): Crispy squid, summer salad, spicy mayo. Contains: Egg, Seafood.
- Smoked Brisket Frankies ($23): Seasonal slaw, chipotle BBQ, flatbread, crushed Avo. Contains: Egg, Seafood.

Kids Menu:
- Chicken and cheese Quesadilla ($10)
- Crispy battered fish and chips ($12)
- Kids Nuggets and chips ($12)

Drinks:
- Bottle Water ($3.50)
- Soft drink ($3.50)
- Juice ($3.50)

Notes: Kids friendly menu available. GF - Gluten Free, D - Contains Dairy, E - Contains Egg, VA - Vegetarian option available, S - Contains Seafood.`;

    navigator.clipboard.writeText(fullMenu);
    setMenuCopied(true);
    setTimeout(() => setMenuCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-on-surface">Form DetailsCheat Sheet</h1>
          <p className="text-on-surface-variant mt-2 max-w-2xl">A quick reference for standardized business details, truck dimensions, and menu information. Click any block to instantly copy it to your clipboard when filling out EOI forms.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Business Details */}
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden h-fit">
            <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-surface-container">
              <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Business Details
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
              <CopyableField label="Contact Name" value="Diwash Joshi" />
              <CopyableField label="Business Name" value="Food Club WA Pty Ltd" />
              <CopyableField label="ABN Number" value="94 666 089 130" />
              <CopyableField label="ACN Number" value="666 089 130" />
              <div className="sm:col-span-2">
                <CopyableField label="Address" value="29A Ewart Street, Midvale WA 6056" />
              </div>
              <CopyableField label="Phone" value="0430 067 850" />
              <CopyableField label="Email" value="foodclubwa2023@gmail.com" />
              <CopyableField label="Facebook" value="https://www.facebook.com/FoodClubWA/" />
            </div>
          </section>

          {/* Insurance Details */}
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden h-fit">
            <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-surface-container">
              <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B82F6]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Insurance Details
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
              <CopyableField label="Insurer" value="GIO" />
              <CopyableField label="Policy Number" value="GPM005823534" />
              <CopyableField label="Public Liability" value="$20,000,000" />
              <CopyableField label="Products Liability" value="$20,000,000" />
              <div className="sm:col-span-2">
                <CopyableField label="Policy Expiry" value="18 Oct 2024" />
              </div>
            </div>
          </section>
        </div>

        {/* Truck & Equipment Details */}
        <div className="space-y-6">
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden">
            <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-surface-container">
              <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#F97316]"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                Truck Details
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
              <CopyableField label="Trade Vehicle Type" value="Vehicle / Van" />
              <CopyableField label="Vehicle Dimensions" value="Size: 2.4m (W) x 6.895m (L)" />
              <CopyableField label="Vehicle Height" value="3.2 mts" />
              <CopyableField label="Serving Side" value="Passenger side" />
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden">
            <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-surface-container">
              <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                Power & Equipment
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 gap-1">
              <CopyableField label="Power Requirements" value="Have own generator using 3 x 15 amp" />
              <CopyableField label="Supply Own Generator?" value="YES" />
              <CopyableField label="Gas Bottles Onsite" value="4" />
              <CopyableField label="Gas Equipment" value="4x Stoves, 2x Fryer, 1x Grill" />
            </div>
          </section>

          {/* Detailed Vehicle Specs */}
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden h-fit">
            <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-surface-container">
              <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B5CF6]"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Detailed Vehicle Specs
              </h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
              <CopyableField label="Registration Plate" value="1IAV147" />
              <CopyableField label="Make & Model" value="2023 MITSUB CANTER" />
              <div className="sm:col-span-2">
                <CopyableField label="VIN / Chassis" value="JLFFEB51G0KJ35150" />
              </div>
              <CopyableField label="Engine Number" value="4P10F73646" />
              <CopyableField label="Tare Weight" value="4580 kg" />
              <CopyableField label="Aggregate Weight" value="6000 kg" />
              <CopyableField label="GCM" value="9500 kg" />
              <div className="sm:col-span-2">
                <CopyableField label="Registration Expiry" value="17 Oct 2024" />
              </div>
            </div>
          </section>
        </div>

        {/* Global Pitch */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden lg:col-span-2">
          <div className="bg-surface-container-low px-6 py-4 border-b border-surface-container">
            <h2 className="font-display text-xl font-bold text-on-surface">Standard Pitch / Description</h2>
          </div>
          <div className="p-4">
            <CopyableField 
              label="Style Summary" 
              value="Tibetan inspired modern dishes: buckwheat waffles, chicken manchurian dishes, smoked brisket frankies." 
            />
            <div className="mt-2">
              <CopyableField 
                label="Full Business Description" 
                multiline
                value="We offer a modern Asian fusion street food menu featuring crispy chicken, pork belly, loaded fries, waffles, and rice bowls with bold flavors such as Manchurian, Sichuan, and honey soy. Our menu includes gluten-free options and freshly prepared items made to order." 
              />
            </div>
          </div>
        </section>

        {/* Menu Items */}
        <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container overflow-hidden lg:col-span-2">
          <div className="bg-primary px-6 py-4 border-b border-primary-container flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
              Standard Menu Offerings
            </h2>
            <button 
              onClick={handleCopyMenu}
              className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium border ${menuCopied ? 'bg-[#10B981] border-[#10B981] text-white shadow-sm' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
            >
              {menuCopied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  Copy Entire Menu
                </>
              )}
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-bold text-on-surface-variant flex items-center gap-2 pb-2 border-b border-surface-container-high">
                Main Dishes
              </h3>
              <CopyableField multiline label="Honey Soy Waffle Chicken ($20)" value="Buckwheat waffle, maple mayo, Asian slaw, chips. Contains: Dairy, Egg." />
              <CopyableField multiline label="Manchurian Pork belly Loaded Fries ($22)" value="Sizzling pork, crispy, sepen sauce, pickle vegetables." />
              <CopyableField multiline label="Lhasa Loaded chicken ($20)" value="Panko crumbed chicken, Sichuan mayo, summer slaw, cheese, chips. Contains: Dairy, Egg." />
              <CopyableField multiline label="Delight Chicken Manchurian ($18 - GF)" value="Crispy chicken, jasmine rice, Manchurian sauce." />
              <CopyableField multiline label="Signature Pork and rice bowl ($23 - GF)" value="Chilli and lime glazed pork belly, sticky rice, boiled egg, sepen sauce, sesame slaw." />
              <CopyableField multiline label="Pork on the bun ($18)" value="BBQ pork, Hoisin Mayo, apple slaw, bun. Contains: Dairy, Egg." />
              <CopyableField multiline label="Vegetable Manchurian ($18 - V)" value="Seasonal vegetable, Jasmine Rice, Manchurian sauce." />
              <CopyableField multiline label="Lime and Lemongrass squid ($23)" value="Crispy squid, summer salad, spicy mayo. Contains: Egg, Seafood." />
              <CopyableField multiline label="Smoked Brisket Frankies ($23)" value="Seasonal slaw, chipotle BBQ, flatbread, crushed Avo. Contains: Egg, Seafood." />
            </div>
            
            <div className="space-y-4">
              <h3 className="font-bold text-on-surface-variant flex items-center gap-2 pb-2 border-b border-surface-container-high">
                Kids Menu & Drinks
              </h3>
              <CopyableField label="Kids: Chicken and cheese Quesadilla" value="$10" />
              <CopyableField label="Kids: Crispy battered fish and chips" value="$12" />
              <CopyableField label="Kids: Kids Nuggets and chips" value="$12" />
              
              <div className="pt-4 border-t border-surface-container-low hidden md:block" />
              <h3 className="font-bold text-on-surface-variant pt-2">Drinks ($3.50 each)</h3>
              <div className="grid grid-cols-2 gap-2">
                <CopyableField label="Bottle Water" value="$3.50" />
                <CopyableField label="Soft drink" value="$3.50" />
                <CopyableField label="Juice" value="$3.50" />
              </div>

              <div className="mt-8 p-4 bg-surface-container-low rounded-xl border border-surface-container">
                <h4 className="font-semibold text-xs uppercase text-on-surface-variant mb-2">Legend Notes</h4>
                <ul className="text-sm text-on-surface font-medium space-y-1">
                  <li>• Kids friendly menu available</li>
                  <li>• GF - Gluten Free</li>
                  <li>• D - Contains Dairy</li>
                  <li>• E - Contains Egg</li>
                  <li>• VA - Vegetarian option available</li>
                  <li>• S - Contains Seafood</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
