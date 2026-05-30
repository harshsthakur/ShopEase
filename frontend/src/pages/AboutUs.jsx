import React from 'react';
import { Leaf, Award, ShieldCheck, HeartHandshake, Sprout, ShieldAlert } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="space-y-16 pb-16 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-slate-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative max-w-4xl mx-auto px-8 py-20 text-center space-y-6">
          <span className="inline-flex items-center space-x-1.5 bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-brand-500/20">
            <Leaf className="h-3.5 w-3.5 text-emerald-500" />
            <span>Our Sourcing Philosophy</span>
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Sourcing Purity, <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-amber-400 to-emerald-400">Delivering Authenticity</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Welcome to ShopEase. We are dedicated to connecting you with the finest local delicacies, 100% natural supplements, and premium traditional products crafted with care.
          </p>
        </div>
      </section>

      {/* Core Values / Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm text-center space-y-4 hover:shadow-md transition-shadow duration-300">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mx-auto">
            <Sprout className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">100% Organic Amla</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Sourced directly from dense, sustainable forests. Our wild amla is handpicked and cold-pressed within hours to preserve vital minerals and high vitamin C potency.
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm text-center space-y-4 hover:shadow-md transition-shadow duration-300">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl w-fit mx-auto">
            <Award className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Premium Alphonso</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Naturally ripened in Devgad orchards on the Konkan coast. We select only the highest grade, export-quality Hapus mangoes, celebrated for their rich color and flavor.
          </p>
        </div>

        <div className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm text-center space-y-4 hover:shadow-md transition-shadow duration-300">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl w-fit mx-auto">
            <HeartHandshake className="h-7 w-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Traditional Modaks</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Handcrafted by culinary artisans following age-old recipes. We use fresh-grated coconut, premium organic jaggery, pure ghee, and Kashmiri saffron to create royal tastes.
          </p>
        </div>
      </section>

      {/* Sourcing details & standards */}
      <section className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Premium Food Standards We Live By
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            At ShopEase, we believe food should be clean, authentic, and close to nature. Our premium category items are prepared without artificial preservatives, synthetic colors, or chemical sweeteners. 
          </p>
          
          <ul className="space-y-4">
            <li className="flex items-start space-x-3">
              <ShieldCheck className="h-5.5 w-5.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Direct-From-Orchard Sourcing</h4>
                <p className="text-slate-500 text-xs mt-0.5">By eliminating middle agencies, we ensure farmers receive fair prices, and you get the freshest harvest.</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <ShieldCheck className="h-5.5 w-5.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Strict Quality Inspections</h4>
                <p className="text-slate-500 text-xs mt-0.5">Every batch of amla juice, mango pulp, and gourmet sweets undergoes sensory and cleanliness checks.</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <ShieldCheck className="h-5.5 w-5.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Premium Eco-Friendly Packaging</h4>
                <p className="text-slate-500 text-xs mt-0.5">Our juices are packed in glass bottles, and our sweets are sealed in food-grade custom boxes to preserve freshness.</p>
              </div>
            </li>
          </ul>
        </div>
        
        {/* Visual Callout */}
        <div className="relative rounded-2xl overflow-hidden aspect-video lg:aspect-square bg-slate-100 shadow-inner group">
          <img 
            src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80" 
            alt="Fresh Organic Sourcing" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6">
            <div className="text-white space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">Clean Food Philosophy</span>
              <h4 className="text-lg font-bold">Guaranteed Freshness and Purity</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Our Story</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          ShopEase was founded with a singular focus: to bridge the gap between small local agricultural orchards and health-conscious food lovers. We travel to diverse micro-climates, from Hapus orchards in Maharashtra to dense wild amla forests, bringing authentic, clean, and nutritious products directly to your doorstep.
        </p>
      </section>

    </div>
  );
};

export default AboutUs;
