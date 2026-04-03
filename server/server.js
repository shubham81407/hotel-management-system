const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Database se connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// Database ka Naksha (Room Schema)
const roomSchema = new mongoose.Schema({
  title: String,
  description: String,
  pricePerNight: Number,
  capacity: Number,
  imageUrl: String,
  isAvailable: { type: Boolean, default: true }
});
const Room = mongoose.model('Room', roomSchema);

// API 1: Search rooms (optional check-in/check-out)
app.get("/api/rooms", async (req, res) => {
  try {
    const checkIn = Array.isArray(req.query.checkIn)
      ? req.query.checkIn[0]
      : req.query.checkIn;
    const checkOut = Array.isArray(req.query.checkOut)
      ? req.query.checkOut[0]
      : req.query.checkOut;

    // If dates are provided, exclude rooms already booked for overlapping dates.
    if (checkIn && checkOut) {
      // Treat date ranges as half-open: [checkIn, checkOut)
      // Overlap exists when booked.checkIn < requested.checkOut AND booked.checkOut > requested.checkIn
      const overlappingBookings = await Booking.find({
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn },
      }).select("roomId");

      const bookedRoomIds = overlappingBookings
        .map((b) => (b.roomId ? b.roomId.toString() : null))
        .filter(Boolean);
      const bookedSet = new Set(bookedRoomIds);

      // Return all rooms, but mark availability based on overlap.
      const rooms = await Room.find().lean();
      const roomsWithAvailability = rooms.map((room) => {
        const isBookedForDates = bookedSet.has(room._id.toString());
        return {
          ...room,
          // Combine DB availability with date overlap availability.
          isAvailable: Boolean(room.isAvailable) && !isBookedForDates,
        };
      });

      return res.json(roomsWithAvailability);
    }

    // If dates not provided, return all rooms.
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// API 2: Naya room add karne ke liye
app.post('/api/rooms', async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.json({ message: 'Naya Room Database me Add ho gaya!', room: newRoom });
  } catch (error) {
    res.status(500).json({ message: "Error adding room" });
  }
});
// API 7: Seed Rooms (Temporary endpoint to populate database with sample rooms)
app.get('/api/seed-rooms', async (req, res) => {
  try {
    const sampleRooms = [
      {
        title: 'Deluxe Suite',
        description: 'A luxurious suite with stunning city views, perfect for a romantic getaway.',
        pricePerNight: 250,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop'
      },
      {
        title: 'Executive Room',
        description: 'Modern room with workspace amenities, ideal for business travelers.',
        pricePerNight: 180,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
      },
      {
        title: 'Family Suite',
        description: 'Spacious suite accommodating up to 4 guests, with separate living area.',
        pricePerNight: 320,
        capacity: 4,
        imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop'
      },
      {
        title: 'Standard Room',
        description: 'Comfortable and affordable room for short stays.',
        pricePerNight: 120,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop'
      },
      {
        title: 'Penthouse',
        description: 'Exclusive top-floor suite with panoramic views and premium amenities.',
        pricePerNight: 500,
        capacity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop'
      }
    ];

    await Room.insertMany(sampleRooms);
    res.json({ message: 'Sample rooms seeded successfully!', rooms: sampleRooms });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding rooms', error: error.message });
  }
});
// Server Start karna
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Hotel Manager (Server) is running on port ${PORT}`));
// Database ka Naksha 2 (Booking Schema)
const bookingSchema = new mongoose.Schema({
  guestName: String,
  email: String,
  phone: String,
  roomId: mongoose.Schema.Types.ObjectId, // Room ka ID
  checkInDate: String,
  checkOutDate: String,
  totalAmount: Number,
  status: { type: String, default: 'Confirmed' }
});
const Booking = mongoose.model('Booking', bookingSchema);
// API 3: Nayi Booking Save karne ke liye
app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.json({ message: 'Booking Successfully Saved!', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: "Booking save karne me error aaya" });
  }
});

// API 4: Saari Bookings dekhne ke liye (Admin Dashboard ke liye kaam aayega)
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// API 4.1: User ki Bookings dekhne ke liye
app.get('/api/my-bookings/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const bookings = await Booking.find({ email });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
// Database ka Naksha 3 (User Schema)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'guest' } // Default role 'guest' hoga
});
const User = mongoose.model('User', userSchema);

// API 5: Naya User Banana (Sign Up)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Password ko encrypt (hash) karna
    const hashedPassword = await bcrypt.hash(password, 10); 
    
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'User successfully registered!' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed. Email shayad pehle se use hui hai.' });
  }
});

// API 6: Login Check Karna
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Email check karo
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User nahi mila' });

    // 2. Password check karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Galat Password' });

    // 3. Sahi hai toh VIP Pass (Token) do
    const token = jwt.sign({ id: user._id, role: user.role }, 'mera_super_secret_key', { expiresIn: '1d' });
    
    res.json({ message: 'Login successful!', token, user: { name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});