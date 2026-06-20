import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";

const app = express();
app.use(express.json());
const PORT = 3000;

// In-memory data store for real-time room availability
const MOCK_ROOMS = [
  {
    id: "r1",
    name: "Classic Supreme",
    description: "A comfortable and elegant room perfect for short stays.",
    price: 35000,
    size: "25m²",
    occupancy: 2,
    available: 8,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1470&auto=format&fit=crop"
  },
  {
    id: "r2",
    name: "Executive Suite",
    description: "Spacious suite with a separate seating area and premium amenities.",
    price: 65000,
    size: "45m²",
    occupancy: 2,
    available: 4,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1470&auto=format&fit=crop"
  },
  {
    id: "r3",
    name: "Presidential Loft",
    description: "Our highest tier accommodation offering ultimate luxury and comfort.",
    price: 120000,
    size: "80m²",
    occupancy: 4,
    available: 1,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1470&auto=format&fit=crop"
  }
];

// In-memory bookings (for loyalty program simple demo and real-time inventory management)
const bookings = [];

app.get("/api/rooms", (req, res) => {
  res.json(MOCK_ROOMS);
});

app.post("/api/book", async (req, res) => {
  const { roomId, checkIn, checkOut, guests, email } = req.body;
  
  const room = MOCK_ROOMS.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }
  
  if (room.available <= 0) {
    return res.status(400).json({ error: "No rooms available for the selected dates." });
  }

  // Handle Stripe Payment if configured
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'ngn',
              product_data: {
                name: room.name,
                description: `Booking from ${checkIn} to ${checkOut} for ${guests} guests.`,
              },
              unit_amount: room.price * 100, // Stripe expects amount in kobo/cents
            },
            quantity: 1, // Number of nights could be calculated here, assuming 1 for simplicity in prototype
          },
        ],
        mode: 'payment',
        success_url: `${appUrl}?booking=success`,
        cancel_url: `${appUrl}?booking=cancelled`,
        customer_email: email,
      });
      
      // We would normally deduct availability after successful webhook, 
      // but for this prototype we'll reserve it now.
      room.available -= 1;
      bookings.push({ roomId, checkIn, checkOut, email, status: 'pending_payment' });
      
      return res.json({ url: session.url });
    } catch (error) {
      console.error("Stripe error:", error);
      return res.status(500).json({ error: "Failed to initialize payment gateway." });
    }
  } else {
    // Mock success if Stripe is not configured
    room.available -= 1; // Real-time deduction
    bookings.push({ roomId, checkIn, checkOut, email, status: 'confirmed' });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({ 
      success: true, 
      message: "Booking confirmed! (Payment gateway mock)",
      pointsEarned: Math.floor(room.price / 100) 
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
