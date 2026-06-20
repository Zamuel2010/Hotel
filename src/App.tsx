import { useState, useEffect } from 'react';
import { Room } from './types';
import { MapPin, Phone, Car, Clock, Wifi, Coffee, Utensils, Award, CheckCircle2, Star, Calendar, ChevronRight, Lock, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays } from 'date-fns';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'rooms'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Room & Booking State
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [email, setEmail] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    fetchRooms();
    
    // Check for Stripe success redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('booking') === 'success') {
      setBookingSuccess(true);
      window.history.replaceState({}, document.title, window.location.pathname); // Clean up URL
    }
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !email) return;

    setIsBooking(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn,
          checkOut,
          guests,
          email
        })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.success) {
        setBookingSuccess(true);
        setEarnedPoints(data.pointsEarned || 0);
        setSelectedRoom(null);
        fetchRooms();
      } else {
        alert(data.error || 'Booking failed');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred during booking.');
    } finally {
      setIsBooking(false);
    }
  };

  const navigateTo = (view: 'home' | 'rooms', sectionId?: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    if (sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderNavBar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <button onClick={() => navigateTo('home')} className="flex items-center gap-2 group">
          <Star className="w-6 h-6 text-gold fill-gold group-hover:scale-110 transition-transform drop-shadow-sm" />
          <span className="font-serif font-bold text-xl tracking-wider text-primary">
            MOMISOLA<span className="font-sans font-light text-sm ml-2 tracking-widest text-secondary">HOTELS</span>
          </span>
        </button>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-[11px] uppercase font-bold tracking-[0.15em] text-secondary">
          <button onClick={() => navigateTo('home')} className={`hover:text-gold transition-colors ${currentView === 'home' && 'text-gold'}`}>Home</button>
          <button onClick={() => navigateTo('home', 'vision')} className="hover:text-gold transition-colors">Our Vision</button>
          <button onClick={() => navigateTo('home', 'amenities')} className="hover:text-gold transition-colors">Amenities</button>
          <button onClick={() => navigateTo('home', 'contact')} className="hover:text-gold transition-colors">Contact</button>
          
          <button 
            onClick={() => navigateTo('rooms')} 
            className="bg-primary text-white hover:bg-gold px-8 py-3.5 rounded-full tracking-[0.2em] font-bold transition-all shadow-[0_5px_15px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 ml-4"
          >
            Check Availability
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-primary">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-6 text-sm font-bold tracking-widest uppercase text-secondary">
              <button onClick={() => navigateTo('home')} className="text-left hover:text-gold">Home</button>
              <button onClick={() => navigateTo('home', 'vision')} className="text-left hover:text-gold">Our Vision</button>
              <button onClick={() => navigateTo('rooms')} className="text-left text-primary">Accommodations</button>
              <button onClick={() => navigateTo('home', 'contact')} className="text-left hover:text-gold">Contact</button>
              <button onClick={() => navigateTo('rooms')} className="text-center w-full py-4 mt-4 bg-primary text-white rounded-lg hover:bg-gold">Check Availability</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );

  const renderHome = () => (
    <motion.div
      key="home"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="pb-20"
    >
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://i.postimg.cc/25QvvfWg/IMG-4784.jpg" 
            alt="Momisola Hotels Exterior" 
            className="w-full h-full object-cover scale-105 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-light via-white/30 to-black/20 pointer-events-none" />
        </div>
        
        <div className="relative z-10 text-center px-4 w-full max-w-5xl mx-auto flex flex-col items-center mt-10">
           <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="bg-white/80 backdrop-blur-xl border border-white p-10 md:p-16 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.08)] relative overflow-hidden group w-full"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-center gap-2 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold fill-gold drop-shadow-sm" />
                  ))}
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-primary mb-6 leading-[1.1]">
                  We never forget <br/>
                  <span className="italic text-gold opacity-90">you have a choice.</span>
                </h1>
                <p className="text-secondary text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-10 leading-relaxed">
                  Experience the highest level of hospitality at an affordable cost. A truly luxurious experience crafted for your absolute comfort in Sango Ota.
                </p>
                
                <button 
                  onClick={() => navigateTo('rooms')}
                  className="bg-primary hover:bg-gold text-white px-12 py-5 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold transition-all shadow-2xl hover:shadow-[0_15px_30px_rgba(197,160,89,0.3)] hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
                >
                  Reserve Your Stay <ArrowRight className="w-4 h-4" />
                </button>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-32 px-6 max-w-5xl mx-auto text-center relative">
        <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-[10px] mb-8 flex items-center justify-center gap-4">
          <span className="w-12 h-[1px] bg-gold/50" />
          Our Vision
          <span className="w-12 h-[1px] bg-gold/50" />
        </h2>
        <p className="font-serif text-4xl md:text-5xl leading-[1.35] text-primary max-w-4xl mx-auto px-4">
          Putting hospitality services on the <span className="italic text-gold">highest level</span> at an affordable cost to satisfy the demands of our guests.
        </p>
      </section>

      {/* Amenities Grid */}
      <section id="amenities" className="py-32 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-20">
            <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-[10px] mb-4">Signature Offerings</h2>
            <h3 className="font-serif text-5xl text-primary">Uncompromising Comfort</h3>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
             {[
               { icon: Car, title: 'Airport Chauffeur' },
               { icon: Clock, title: '24/7 Check-in' },
               { icon: MapPin, title: 'Free Parking' },
               { icon: Wifi, title: 'High-Speed WiFi' },
               { icon: Coffee, title: 'Room Service' },
               { icon: Utensils, title: 'Fine Dining' },
             ].map((item, i) => (
               <div key={i} className="flex flex-col items-center group cursor-pointer p-6 rounded-3xl hover:bg-bg-light transition-colors border border-transparent hover:border-gray-50">
                 <div className="w-20 h-20 rounded-full bg-white shadow-[0_5px_15px_rgba(0,0,0,0.04)] border border-gray-50 flex items-center justify-center mb-6 text-gold group-hover:bg-gold group-hover:text-white transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_15px_30px_rgba(197,160,89,0.3)]">
                   <item.icon strokeWidth={1.5} className="w-8 h-8" />
                 </div>
                 <span className="text-[10px] tracking-widest uppercase font-bold text-primary">{item.title}</span>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Loyalty Program */}
      <section className="py-32 bg-primary text-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/20 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <Award className="w-16 h-16 text-gold mx-auto mb-8 animate-[pulse_4s_ease-in-out_infinite]" />
          <h2 className="font-serif text-5xl md:text-6xl text-white mb-6">Momisola <span className="text-gold italic">Elite</span></h2>
          <p className="text-white/70 font-light text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join our exclusive inner circle. Earn points on every stay, enjoy complimentary upgrades, priority check-in, and special dining privileges.
          </p>
          <button className="bg-transparent border border-gold text-gold hover:bg-gold hover:text-primary px-10 py-5 rounded-full uppercase tracking-[0.2em] text-[11px] font-bold transition-all">
            Join the Club
          </button>
        </div>
      </section>
    </motion.div>
  );

  const renderRooms = () => (
    <motion.div
      key="rooms"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen"
    >
      <div className="text-center mb-16 pt-8">
        <h2 className="text-gold font-bold tracking-[0.2em] uppercase text-[10px] mb-4">Reservations</h2>
        <h3 className="font-serif text-4xl md:text-6xl text-primary mb-6">Check Availability</h3>
        <p className="text-secondary font-light max-w-2xl mx-auto text-lg">Select your preferred dates to discover our elegant rooms and suites, perfectly arranged for your comfort.</p>
      </div>

      {/* Availability Filter - Glassmorphism Light Mode */}
      <div className="bg-white/90 backdrop-blur-md border border-gray-100 p-3 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row gap-2 max-w-5xl mx-auto mb-20 relative">
         <div className="flex-1 px-8 py-4 border-b md:border-b-0 md:border-r border-gray-100">
            <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2 block">Check In</label>
            <input 
              type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full bg-transparent text-primary font-medium outline-none cursor-pointer"
            />
         </div>
         <div className="flex-1 px-8 py-4 border-b md:border-b-0 md:border-r border-gray-100">
            <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2 block">Check Out</label>
            <input 
              type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
              min={addDays(new Date(checkIn), 1).toISOString().split('T')[0]}
              className="w-full bg-transparent text-primary font-medium outline-none cursor-pointer"
            />
         </div>
         <div className="flex-1 px-8 py-4 border-b md:border-b-0 md:border-r border-gray-100">
            <label className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-2 block">Guests</label>
            <select 
              value={guests} onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent text-primary font-medium outline-none cursor-pointer appearance-none"
            >
              <option value={1}>1 Guest</option>
              <option value={2}>2 Guests</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests</option>
            </select>
         </div>
         <button className="bg-primary hover:bg-gold text-white px-12 py-5 rounded-[2rem] uppercase tracking-[0.2em] font-bold text-[11px] transition-all shadow-md m-1.5 flex items-center justify-center">
            Search
         </button>
      </div>

      {loading ? (
         <div className="flex justify-center py-24">
            <div className="w-12 h-12 border-[3px] border-gray-100 border-t-gold rounded-full animate-spin" />
         </div>
      ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {rooms.map((room, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               key={room.id} 
               className="group rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-[0_5px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] transition-all duration-500 relative flex flex-col"
             >
               <div className="relative h-[22rem] overflow-hidden shrink-0">
                 <img 
                   src={room.image} alt={room.name} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                 />
                 <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-bold tracking-widest shadow-lg text-primary">
                   ₦ {room.price.toLocaleString()} <span className="font-light text-secondary lowercase">/ night</span>
                 </div>
                 {room.available <= 2 && room.available > 0 && (
                   <div className="absolute top-5 right-5 bg-red-500/90 backdrop-blur-md px-4 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-white shadow-lg">
                     Only {room.available} left!
                   </div>
                 )}
                  {room.available === 0 && (
                   <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-primary font-bold tracking-[0.3em] border-[2px] border-primary rounded-full py-4 px-10 uppercase bg-white">Sold Out</span>
                   </div>
                 )}
               </div>
               
               <div className="p-8 flex flex-col flex-1">
                 <h4 className="font-serif text-3xl mb-4 text-primary group-hover:text-gold transition-colors">{room.name}</h4>
                 <p className="text-secondary text-sm mb-8 font-light leading-relaxed flex-1">{room.description}</p>
                 
                 <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 bg-bg-light p-5 rounded-2xl border border-gray-50">
                   <span className="flex-1 text-center">{room.size}</span>
                   <span className="text-gray-200">|</span>
                   <span className="flex-1 text-center">Up to {room.occupancy}</span>
                 </div>
                 
                 <button 
                   onClick={() => setSelectedRoom(room)}
                   disabled={room.available === 0}
                   className="relative flex items-center justify-center w-full py-5 text-[11px] font-bold uppercase tracking-[0.2em] bg-white text-primary disabled:opacity-50 disabled:cursor-not-allowed border-[2px] border-gray-100 rounded-[1.5rem] hover:bg-primary hover:text-white hover:border-primary transition-all group/btn"
                 >
                   <span className="flex items-center gap-2">
                     {room.available > 0 ? "Book Now" : "Unavailable"}
                     {room.available > 0 && <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                   </span>
                 </button>
               </div>
             </motion.div>
           ))}
         </div>
      )}
    </motion.div>
  );

  const renderFooter = () => (
    <footer id="contact" className="bg-white border-t border-gray-100 pt-24 pb-12 relative mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 border-b border-gray-100 pb-16 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Star className="w-5 h-5 text-gold fill-gold" />
            <span className="font-serif font-bold text-xl tracking-[0.1em] text-primary">MOMISOLA</span>
          </div>
          <p className="mb-6 max-w-sm leading-relaxed text-secondary font-light text-sm">
            3, Laniyan Close, Off Samuel Adeleke Avenue, Kilometre 6, Ota/IdiRoko Expressway, Opposite Honda Manufacturing Factory Training School, Magistrate High Court Bus Stop, Sango Ota, Nigeria.
          </p>
        </div>
        
        <div>
          <h4 className="text-primary font-bold tracking-[0.2em] uppercase mb-8 text-[10px]">Contact Us</h4>
          <ul className="space-y-6 text-sm font-medium text-secondary">
            <li className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-bg-light border border-gray-100 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all">
                <Phone className="w-4 h-4" />
              </div>
              <span>+234 810 600 1256</span>
            </li>
            <li className="flex items-center gap-4 group">
               <div className="w-10 h-10 rounded-full bg-bg-light border border-gray-100 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all">
                 <Phone className="w-4 h-4" />
               </div>
               <span>+234 813 697 6398</span>
            </li>
          </ul>
        </div>

        <div>
           <h4 className="text-primary font-bold tracking-[0.2em] uppercase mb-8 text-[10px]">Digital Info</h4>
           <ul className="space-y-6 text-sm font-medium text-secondary">
             <li className="flex items-center gap-4 group">
               <div className="w-10 h-10 rounded-full bg-bg-light border border-gray-100 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
               </div>
               <span>+234 813 153 4590 <span className="text-[10px] ml-1 uppercase text-gray-400 font-bold">(WA)</span></span>
             </li>
             <li className="pt-2">
               <a href="#" className="font-bold text-primary tracking-widest text-[10px] uppercase block mb-1 hover:text-gold transition-colors">@MOMISOLAHOTELS</a>
             </li>
           </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-400">
        <p>Copyright © {new Date().getFullYear()} Momisola Hotels.</p>
        <p>* Rates subject to change.</p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-bg-light text-primary font-sans selection:bg-gold selection:text-white">
      {renderNavBar()}
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentView === 'home' ? renderHome() : renderRooms()}
        </AnimatePresence>
      </main>

      {renderFooter()}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedRoom && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="fixed inset-0 z-[100] flex items-center justify-end bg-primary/40 backdrop-blur-md"
           >
             <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}
               className="bg-white w-full max-w-lg h-full flex flex-col shadow-[-30px_0_60px_rgba(0,0,0,0.1)]"
             >
               <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-serif text-3xl text-primary">Complete Booking</h3>
                 <button 
                   onClick={() => setSelectedRoom(null)} 
                   className="w-10 h-10 rounded-full bg-bg-light border border-gray-100 flex items-center justify-center text-secondary hover:text-primary transition-colors text-2xl font-light"
                 >
                   ×
                 </button>
               </div>
               
               <div className="p-8 flex-1 overflow-y-auto">
                 <div className="mb-10 pb-10 border-b border-gray-100">
                   <h4 className="font-serif text-2xl mb-2 text-primary">{selectedRoom.name}</h4>
                   <p className="text-lg text-gold mb-8 font-bold">₦ {selectedRoom.price.toLocaleString()} <span className="text-secondary text-sm font-light">per night</span></p>
                   
                   <div className="grid grid-cols-2 gap-4 text-sm bg-bg-light p-6 rounded-[1.5rem] border border-gray-100">
                     <div>
                       <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-[0.2em] mb-2">Check In</span>
                       <span className="text-primary font-bold">{checkIn}</span>
                     </div>
                     <div>
                       <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-[0.2em] mb-2">Check Out</span>
                       <span className="text-primary font-bold">{checkOut}</span>
                     </div>
                     <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
                       <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-[0.2em] mb-2">Guests</span>
                       <span className="text-primary font-bold">{guests}</span>
                     </div>
                   </div>
                 </div>
 
                 <form onSubmit={handleBook} className="space-y-8">
                   <div>
                     <label className="block text-[10px] uppercase text-gray-400 font-bold tracking-[0.2em] mb-3">Email Address</label>
                     <input 
                       type="email" required value={email} onChange={e => setEmail(e.target.value)}
                       className="w-full bg-white border border-gray-200 rounded-[1.5rem] px-6 py-5 text-primary focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all placeholder:text-gray-300 shadow-sm"
                       placeholder="guest@example.com"
                     />
                   </div>
                   
                   <button 
                     type="submit" disabled={isBooking}
                     className="w-full py-5 rounded-[1.5rem] bg-primary text-white uppercase tracking-[0.2em] text-[11px] font-bold shadow-xl hover:bg-gold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 relative"
                   >
                     {isBooking ? (
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                     ) : (
                       <>Confirm & Pay</>
                     )}
                   </button>
                   <p className="text-[10px] uppercase tracking-widest text-center text-gray-400 mt-6 flex items-center justify-center gap-2 font-bold">
                     <Lock className="w-3.5 h-3.5 text-green-500"/> Secure Payment via Stripe Checkout
                   </p>
                 </form>
               </div>
             </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-primary/40 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white border border-gray-100 p-12 max-w-md w-full text-center rounded-[2.5rem] shadow-2xl relative"
            >
              <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 shadow-sm">
                <CheckCircle2 strokeWidth={1.5} className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-3xl mb-4 text-primary">Reservation Confirmed</h3>
              <p className="text-secondary font-light mb-8 leading-relaxed">
                We are thrilled to welcome you. Your confirmation details have been sent securely to your email.
              </p>
              {earnedPoints > 0 && (
                <div className="bg-gold/10 border border-gold/20 text-gold-dark py-3 px-6 rounded-xl inline-block font-bold text-xs mb-8 uppercase tracking-widest">
                  You earned {earnedPoints} Elite Points!
                </div>
              )}
              <button 
                onClick={() => setBookingSuccess(false)}
                className="block w-full py-5 bg-bg-light border border-gray-200 text-primary rounded-xl hover:bg-gray-100 uppercase tracking-[0.2em] text-[10px] font-bold transition-all shadow-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
