import React from 'react';
import { ArrowRight, Leaf, Award, Sparkles, Cherry } from 'lucide-react';

const Categories = ({ setPage, setFilterCategory }) => {
  const categoriesList = [
    {
      name: 'Amla',
      slug: 'amla',
      description: 'Authentic, nutrient-rich organic Amla candy, juices, and powders for daily health and immunity boost.',
      items: ['Amla Candy', 'Amla Juice', 'Amla Powder', 'Dried Amla'],
      image: 'https://images.unsplash.com/photo-1610970881699-44a5587caaec?auto=format&fit=crop&w=600&q=80',
      icon: Leaf,
      borderColor: 'border-emerald-200 hover:border-emerald-400',
      badgeColor: 'bg-emerald-50 text-emerald-700',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10'
    },
    {
      name: 'Mango',
      slug: 'mango',
      description: 'Premium handpicked Alphonso mangoes, delicious pure pulp, traditional sweet pickles, and dehydrated slices.',
      items: ['Alphonso Mango', 'Mango Pulp', 'Mango Pickle', 'Dried Mango Slices'],
      image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80',
      icon: Award,
      borderColor: 'border-amber-200 hover:border-amber-400',
      badgeColor: 'bg-amber-50 text-amber-700',
      buttonBg: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/10'
    },
    {
      name: 'Modak',
      slug: 'modak',
      description: 'Traditional and gourmet Indian festival sweets including steamed Ukadiche Modak, dry fruit, chocolate, and Kesar flavors.',
      items: ['Ukadiche Modak', 'Chocolate Modak', 'Dry Fruit Modak', 'Kesar Modak'],
      image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
      icon: Sparkles,
      borderColor: 'border-orange-200 hover:border-orange-400',
      badgeColor: 'bg-orange-50 text-orange-700',
      buttonBg: 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/10'
    },
    {
      name: 'Fruit Jam',
      slug: 'fruit-jam',
      description: 'Delectable fruit preserves, jams, and marmalades made from real, sun-ripened berries and citrus fruits.',
      items: ['Mixed Fruit Jam', 'Strawberry Jam', 'Mango Jam', 'Pineapple Jam', 'Orange Marmalade', 'Mixed Berry Jam'],
      image: 'https://images.unsplash.com/photo-1546173152-318e7b25572c?auto=format&fit=crop&w=600&q=80',
      icon: Cherry,
      borderColor: 'border-rose-200 hover:border-rose-400',
      badgeColor: 'bg-rose-50 text-rose-700',
      buttonBg: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/10'
    }
  ];

  const handleExplore = (slug) => {
    setFilterCategory(slug);
    setPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 pb-16 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex items-center space-x-1 bg-brand-50 text-brand-700 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
          <span>Fresh & Natural Range</span>
        </span>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Our Premium Categories</h1>
        <p className="text-sm text-slate-500">
          Explore our handpicked organic range. From traditional sweets to immunity-boosting supplements, we provide the highest quality natural foods.
        </p>
      </div>

      {/* Grid: 4 Categories Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {categoriesList.map((cat) => {
          const Icon = cat.icon;
          return (
            <div 
              key={cat.slug} 
              className={`bg-white border rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group ${cat.borderColor}`}
            >
              
              <div>
                {/* Image block */}
                <div className="relative aspect-video overflow-hidden bg-slate-100 shadow-inner">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${cat.badgeColor}`}>
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.name}</span>
                    </span>
                  </div>
                </div>

                {/* Content block */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-slate-800">{cat.name} Specialties</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{cat.description}</p>
                  
                  {/* Products bullet list */}
                  <div className="border-t border-slate-50 pt-4 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Products Included:</h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {cat.items.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action block */}
              <div className="p-6 pt-0">
                <button
                  onClick={() => handleExplore(cat.slug)}
                  className={`w-full py-3 px-5 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 cursor-pointer outline-none shadow-md active:scale-[0.98] ${cat.buttonBg}`}
                >
                  <span>Explore {cat.name}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          );
        })}
      </section>

    </div>
  );
};

export default Categories;
